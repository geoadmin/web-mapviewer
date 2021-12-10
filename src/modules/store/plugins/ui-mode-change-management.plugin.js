import { UIModes } from '@/modules/store/modules/ui.store'
import bootstrapVariable from '@/scss/bootstrap-theme.scss'

const widthThresholdToAlwaysShowMenu = parseInt(bootstrapVariable.sm.replace('px', ''))
const heightMinimumThresholdToAlwaysShowMenu = 500

/** @param store */
const uiModeChangeManagementPlugin = (store) => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setUiMode') {
            switch (state.ui.mode) {
                case UIModes.MENU_OPENED_THROUGH_BUTTON:
                    // we need to show the overlay if the menu is shown
                    if (state.ui.showMenuTray && !state.ui.showDrawingOverlay) {
                        store.dispatch('showOverlay', () => {
                            // hiding the menu tray whenever the user clicks on the overlay
                            if (state.ui.showMenuTray) {
                                store.dispatch('toggleMenuTray')
                            }
                            return false
                        })
                    }
                    break
                case UIModes.MENU_ALWAYS_OPEN:
                    // we need to hide the overlay if it is shown
                    if (state.overlay.show) {
                        store.dispatch('hideOverlayIgnoringCallbacks')
                    }
                    break
            }
        } else if (mutation.type === 'setSize') {
            // listening to screen size change to decide if we should switch UI mode too
            let wantedUiMode
            if (
                state.ui.width >= widthThresholdToAlwaysShowMenu &&
                state.ui.height > heightMinimumThresholdToAlwaysShowMenu
            ) {
                wantedUiMode = UIModes.MENU_ALWAYS_OPEN
            } else {
                wantedUiMode = UIModes.MENU_OPENED_THROUGH_BUTTON
            }
            if (wantedUiMode !== state.ui.mode) {
                console.log('switching to', wantedUiMode)
                store.dispatch('setUiMode', wantedUiMode)
            }
        }
    })
}

export default uiModeChangeManagementPlugin
