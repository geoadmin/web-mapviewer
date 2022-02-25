import { UIModes } from '@/modules/store/modules/ui.store'
import { screenThresholdToShowTheSideMenu } from '@/config'

/** @param store */
const screenSizeManagementPlugin = (store) => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setSize') {
            // listening to screen size change to decide if we should switch UI mode too
            let wantedUiMode
            if (
                state.ui.width >= screenThresholdToShowTheSideMenu.width &&
                state.ui.height > screenThresholdToShowTheSideMenu.height
            ) {
                wantedUiMode = UIModes.MENU_ALWAYS_OPEN
            } else {
                wantedUiMode = UIModes.MENU_OPENED_THROUGH_BUTTON
            }
            if (wantedUiMode !== state.ui.mode) {
                store.dispatch('setUiMode', wantedUiMode)
                // if the UI mode is set to "menu opened through a button" (mobile)
                // and that the tooltip is still set to floating, we set it in the footer
                // or
                // if the UI mode is set to "menu always open" (desktop) and the
                // tooltip is fixed at the bottom (in the footer) we set it to floating
                if (
                    (wantedUiMode === UIModes.MENU_OPENED_THROUGH_BUTTON &&
                        state.ui.floatingTooltip) ||
                    (wantedUiMode === UIModes.MENU_ALWAYS_OPEN && !state.ui.floatingTooltip)
                ) {
                    store.dispatch('toggleFloatingTooltip')
                }
            }
        }
    })
}

export default screenSizeManagementPlugin
