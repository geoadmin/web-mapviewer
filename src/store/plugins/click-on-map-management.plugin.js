import { identify } from '@/api/features/features.api.js'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { ClickType } from '@/store/modules/map.store'
import log from '@/utils/logging'

/**
 * Identifies feature under the mouse cursor
 *
 * @param {Vuex.Store} store
 * @param {ClickInfo} clickInfo Store mutation payload
 * @param {GeoAdminLayer[]} visibleLayers All currently visible layers on the map
 * @param {String} lang
 * @param {CoordinateSystem} projection
 */
const runIdentify = async (store, clickInfo, visibleLayers, lang, projection) => {
    // we run identify only if there are visible layers (other than background)
    if (visibleLayers.length > 0) {
        const allRequests = []
        // for each layer we run a backend request
        visibleLayers.forEach((layer) => {
            if ([LayerTypes.GEOJSON, LayerTypes.KML, LayerTypes.GPX].includes(layer.type)) {
                allRequests.push(new Promise((resolve) => resolve(clickInfo.features)))
            } else if (layer.hasTooltip) {
                allRequests.push(
                    identify(
                        layer,
                        clickInfo.coordinate,
                        store.getters.extent.flat(),
                        store.state.ui.width,
                        store.state.ui.height,
                        lang,
                        projection
                    )
                )
            } else {
                log.debug('ignoring layer', layer, 'no tooltip')
            }
        })
        const values = await Promise.all(allRequests)
        // grouping all features from the different requests
        const allFeatures = values.flat()
        // dispatching all features by going through them in order to keep only one time each of them (no double)
        return allFeatures.filter((feature, index) => allFeatures.indexOf(feature) === index)
    }
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
            store.dispatch('hideLocationPopup')
        }
        // if a click occurs, we only take it into account (for identify and fullscreen toggle)
        // when the user is not currently drawing something on the map.
        else if (mutation.type === 'setClickInfo' && !state.ui.showDrawingOverlay) {
            const clickInfo = mutation.payload
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
                    store.dispatch('showToolTip')
                    store.dispatch('setSelectedFeatures', newSelectedFeatures)
                })
            }
            if (isContextMenuClick) {
                store.dispatch('clearAllSelectedFeatures')
                store.dispatch('displayLocationPopup')
            } else {
                store.dispatch('hideLocationPopup')
            }
        }
    })
}

export default clickOnMapManagementPlugin
