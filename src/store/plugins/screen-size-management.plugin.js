import { UIModes } from '@/store/modules/ui.store'
import { BREAKPOINT_PHONE_WIDTH, BREAKPOINT_PHONE_HEIGHT, BREAKPOINT_TABLET } from '@/config'

/** @param store */
const screenSizeManagementPlugin = (store) => {
    let lastWidth = window.innerWidth

    store.subscribe((mutation, state) => {
        if (mutation.type === 'setSize') {
            // listening to screen size change to decide if we should switch UI mode too
            let wantedUiMode
            if (
                state.ui.width >= BREAKPOINT_PHONE_WIDTH &&
                state.ui.height > BREAKPOINT_PHONE_HEIGHT
            ) {
                wantedUiMode = UIModes.MENU_ALWAYS_OPEN
            } else {
                wantedUiMode = UIModes.MENU_OPENED_THROUGH_BUTTON
            }
            if (wantedUiMode !== state.ui.mode) {
                store.dispatch('setUiMode', wantedUiMode)
                if (wantedUiMode === UIModes.MENU_ALWAYS_OPEN) {
                    store.commit('setShowMenuTray', true)
                }
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

            // Check if the viewport width passes the configured tablet threshold.
            if (state.ui.width > BREAKPOINT_TABLET && lastWidth <= BREAKPOINT_TABLET) {
                // Open the menu if the viewport passes to desktop size.
                store.commit('setShowMenuTray', true)
            } else if (state.ui.width <= BREAKPOINT_TABLET && lastWidth > BREAKPOINT_TABLET) {
                // Close the menu if the viewport passes to tablet size.
                store.commit('setShowMenuTray', false)
            }
            // Update the last width for the next check.
            lastWidth = state.ui.width
        }
    })
}

export default screenSizeManagementPlugin
