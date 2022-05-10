import { identify } from '@/api/features.api'
import { ClickType } from '@/store/modules/map.store'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import log from '@/utils/logging'
import { UIModes } from '@/store/modules/ui.store'

/**
 * Identifies feature under the mouse cursor
 *
 * @param {Vuex.Store} store
 * @param {ClickInfo} clickInfo Store mutation payload
 * @param {(WMSLayer | WMTSLayer | GeoJsonLayer | AggregateLayer)[]} visibleLayers All currently
 *   visible layers on the map
 * @param {String} lang
 */
const runIdentify = (store, clickInfo, visibleLayers, lang) => {
    // we run identify only if there are visible layers (other than background)
    if (visibleLayers.length > 0) {
        const allRequests = []
        // for each layer we run a backend request
        visibleLayers.forEach((layer) => {
            if (layer.type === LayerTypes.GEOJSON) {
                allRequests.push(new Promise((resolve) => resolve(clickInfo.geoJsonFeatures)))
            } else if (layer.hasTooltip) {
                allRequests.push(
                    identify(
                        layer,
                        clickInfo.coordinate,
                        store.getters.extent.flat(),
                        store.state.ui.width,
                        store.state.ui.height,
                        lang
                    )
                )
            } else {
                log.debug('ignoring layer', layer, 'no tooltip')
            }
        })
        Promise.all(allRequests).then((values) => {
            // grouping all features from the different requests
            const allFeatures = values.flat()
            // dispatching all features by going through them in order to keep only one time each of them (no double)
            store.dispatch(
                'setSelectedFeatures',
                allFeatures.filter((feature, index) => allFeatures.indexOf(feature) === index)
            )
        })
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
        // if a click occurs, we only take it into account (for identify and fullscreen toggle)
        // when the user is not currently drawing something on the map
        if (mutation.type === 'setClickInfo' && !state.ui.showDrawingOverlay) {
            const clickInfo = mutation.payload
            const isDesktop = state.ui.mode === UIModes.MENU_ALWAYS_OPEN
            const isLeftClick = clickInfo?.clickType === ClickType.LEFT_CLICK
            const isLongClick = clickInfo?.millisecondsSpentMouseDown >= 500

            if (
                (isDesktop && isLeftClick) ||
                (!isDesktop && isLeftClick && isLongClick) ||
                (!isDesktop && !isLeftClick)
            ) {
                runIdentify(store, clickInfo, store.getters.visibleLayers, store.state.i18n.lang)
            } else if (!isDesktop && isLeftClick && !isLongClick) {
                store.dispatch('toggleFullscreenMode')
            } else if (isDesktop && !isLeftClick) {
                store.dispatch('clearSelectedFeatures')
            }
        }
    })
}

export default clickOnMapManagementPlugin
