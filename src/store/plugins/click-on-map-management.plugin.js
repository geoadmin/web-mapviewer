import { ClickType } from '@/store/modules/map.store'
import { FeatureInfoPositions } from '@/store/modules/ui.store'

const dispatcher = { dispatcher: 'click-on-map-management.plugin' }

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
        else if (mutation.type === 'setClickInfo' && !state.drawing.drawingOverlay.show) {
            const clickInfo = mutation.payload.clickInfo
            const isLeftSingleClick = clickInfo?.clickType === ClickType.LEFT_SINGLECLICK
            const isContextMenuClick = clickInfo?.clickType === ClickType.CONTEXTMENU
            if (isLeftSingleClick) {
                store
                    .dispatch('identifyFeatureAt', {
                        layers: store.getters.visibleLayers.filter((layer) => layer.hasTooltip),
                        vectorFeatures: clickInfo.features,
                        coordinate: clickInfo.coordinate,
                        ...dispatcher,
                    })
                    .then(() => {
                        if (
                            store.getters.noFeatureInfo &&
                            state.features.selectedFeaturesByLayerId.length > 0
                        ) {
                            // we only change the feature Info position when it's set to 'NONE', as
                            // we want to keep the user's choice of position between clicks.
                            store.dispatch('setFeatureInfoPosition', {
                                position: FeatureInfoPositions.DEFAULT,
                                ...dispatcher,
                            })
                        }
                    })
            }
            if (isContextMenuClick) {
                store.dispatch('displayLocationPopup', dispatcher)
            }
        }
    })
}

export default clickOnMapManagementPlugin
