import { UIModes } from '@/modules/store/modules/ui.store'

/**
 * Plugin managing the UI fullscreen mode when drawing, toggling the menu tray / map overlay when needed
 *
 * @param {Vuex.Store} store
 */

const drawingOverlayAndMenuManagementPlugin = (store) => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setShowDrawingOverlay') {
            store.dispatch('toggleHeader')
            store.dispatch('toggleZoomGeolocationButtons')
            if (state.ui.showDrawingOverlay) {
                // keep overlay's callback otherwise the menu will not know what to do later
                // when it will be back on the screen and the user clicks on the overlay
                store.dispatch('hideOverlayIgnoringCallbacks')
            } else if (state.ui.mode === UIModes.TOUCH) {
                store.dispatch('showOverlay')
            }
        }
    })
}

export default drawingOverlayAndMenuManagementPlugin
