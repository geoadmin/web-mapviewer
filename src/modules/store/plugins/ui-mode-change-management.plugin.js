import { UIModes } from '@/modules/store/modules/ui.store'

/** @param store */
const uiModeChangeManagementPlugin = (store) => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setUiMode') {
            switch (state.ui.mode) {
                case UIModes.TOUCH:
                    // we need to show the overlay if the menu is shown
                    if (state.ui.showMenuTray) {
                        store.dispatch('showOverlay', () => {
                            // hiding the menu tray whenever the user clicks on the overlay
                            if (state.ui.showMenuTray) {
                                store.dispatch('toggleMenuTray')
                            }
                            return false
                        })
                    }
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
