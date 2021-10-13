import { UIModes } from '@/modules/store/modules/ui.store'

/** @param store */
const uiModeChangeManagementPlugin = (store) => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setUiMode') {
            // we keep the menu tray shown
            if (!state.ui.showMenuTray) {
                store.dispatch('toggleMenuTray')
            }
            switch (state.ui.mode) {
                case UIModes.TOUCH:
                    // we show the overlay under the menu whenever we go mobile
                    store.dispatch('showOverlay', () => {
                        // hiding the menu tray whenever the user clicks on the overlay
                        store.dispatch('toggleMenuTray')
                        return false
                    })
                    break
                case UIModes.DESKTOP:
                    // we need to hide the overlay if it is shown
                    if (state.overlay.show) {
                        store.dispatch('hideOverlayIgnoringCallbacks')
                    }
                    break
            }
        }
    })
}

export default uiModeChangeManagementPlugin
