import { containsCoordinate } from 'ol/extent'

import { identify } from '@/api/features/features.api'
import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
import ExternalLayer from '@/api/layers/ExternalLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { ClickType } from '@/store/modules/map.store'
import { flattenExtent } from '@/utils/coordinates/coordinateUtils'
import log from '@/utils/logging'

import { FeatureInfoPositions } from '../modules/ui.store'

const dispatcher = { dispatcher: 'click-on-map-management.plugin' }

/**
 * Identifies feature under the mouse cursor
 *
 * @param {Vuex.Store} store
 * @param {ClickInfo} clickInfo Store mutation payload
 * @param {GeoAdminLayer[]} visibleLayers All currently visible layers on the map
 * @param {String} lang
 * @param {CoordinateSystem} projection
 * @returns {Promise<LayerFeature[]>}
 */
const runIdentify = (store, clickInfo, visibleLayers, lang, projection) => {
    return new Promise((resolve, reject) => {
        // we run identify only if there are visible layers
        if (visibleLayers.length === 0) {
            resolve([])
        }
        const allFeatures = []
        const pendingRequests = []
        // for each layer we run a backend request
        visibleLayers.forEach((layer) => {
            if ([LayerTypes.GEOJSON, LayerTypes.KML, LayerTypes.GPX].includes(layer.type)) {
                allFeatures.push(clickInfo.features)
            } else if (layer.hasTooltip) {
                if (
                    !(layer instanceof ExternalLayer) ||
                    containsCoordinate(flattenExtent(layer.extent), clickInfo.coordinate)
                ) {
                    if (layer instanceof ExternalGroupOfLayers) {
                        // for group of layers, we fire a request per sublayer
                        layer.layers.forEach((sublayer) => {
                            pendingRequests.push(
                                identify({
                                    layer: sublayer,
                                    coordinate: clickInfo.coordinate,
                                    resolution: store.getters.resolution,
                                    mapExtent: store.getters.extent.flat(),
                                    screenWidth: store.state.ui.width,
                                    screenHeight: store.state.ui.height,
                                    lang,
                                    projection,
                                })
                            )
                        })
                    } else {
                        pendingRequests.push(
                            identify({
                                layer,
                                coordinate: clickInfo.coordinate,
                                resolution: store.getters.resolution,
                                mapExtent: store.getters.extent.flat(),
                                screenWidth: store.state.ui.width,
                                screenHeight: store.state.ui.height,
                                lang,
                                projection,
                            })
                        )
                    }
                } else {
                    log.debug(
                        'ignoring layer',
                        layer,
                        'coordinate',
                        clickInfo.coordinate,
                        'outside of extent',
                        layer.extent
                    )
                }
            } else {
                log.debug('ignoring layer', layer, 'no tooltip')
            }
        })
        // grouping all features from the different requests
        Promise.allSettled(pendingRequests)
            .then((responses) => {
                responses.forEach((response) => {
                    if (response.status === 'fulfilled') {
                        allFeatures.push(...response.value)
                    } else {
                        log.error('Error while identifying features', response.reason?.message)
                        // no reject, so that we may see at least the result of requests that have been fulfilled
                    }
                })
                // filtering out doppelgangers
                resolve(
                    allFeatures.filter((feature, index) => allFeatures.indexOf(feature) === index)
                )
            })
            .catch((error) => {
                log.error('Error while identifying features', error)
                reject(error)
            })
    })
}

/**
 * Vuex plugins that will listen to click events and act depending on what's under the click (or how
 * long the mouse button was down)
 *
 * @param {Vuex.Store} store
 */
const clickOnMapManagementPlugin = (store) => {
    store.subscribe((mutation, state) => {
        if (
            mutation.type === 'setShowDrawingOverlay' &&
            mutation.payload &&
            state.map.displayLocationPopup
        ) {
            // when entering the drawing menu we need to clear the location popup
            store.dispatch('hideLocationPopup', dispatcher)
        }
        // if a click occurs, we only take it into account (for identify and fullscreen toggle)
        // when the user is not currently drawing something on the map.
        else if (mutation.type === 'setClickInfo' && !state.ui.showDrawingOverlay) {
            const clickInfo = mutation.payload.clickInfo
            const isLeftSingleClick = clickInfo?.clickType === ClickType.LEFT_SINGLECLICK
            const isContextMenuClick = clickInfo?.clickType === ClickType.CONTEXTMENU

            if (isLeftSingleClick) {
                // running an identification of feature even if we cleared the search result
                runIdentify(
                    store,
                    clickInfo,
                    store.getters.visibleLayers,
                    store.state.i18n.lang,
                    state.position.projection
                ).then((newSelectedFeatures) => {
                    store.dispatch('setSelectedFeatures', {
                        features: newSelectedFeatures,
                        ...dispatcher,
                    })
                    if (store.getters.noFeatureInfo && newSelectedFeatures.length > 0) {
                        // we only change the feature Info position when it's set to 'NONE', as
                        // we want to keep the user's choice of position between clicks.
                        store.dispatch('setFeatureInfoPosition', {
                            featureInfo: FeatureInfoPositions.DEFAULT,
                            ...dispatcher,
                        })
                    }
                })
            }
            if (isContextMenuClick) {
                store.dispatch('clearAllSelectedFeatures', dispatcher)
                store.dispatch('displayLocationPopup', dispatcher)
            } else {
                store.dispatch('hideLocationPopup', dispatcher)
            }
        }
    })
}

export default clickOnMapManagementPlugin
