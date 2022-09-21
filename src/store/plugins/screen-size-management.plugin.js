import { UIModes } from '@/store/modules/ui.store'
import { BREAKPOINT_PHONE_WIDTH, BREAKPOINT_PHONE_HEIGHT, BREAKPOINT_TABLET } from '@/config'

/** @param store */
const screenSizeManagementPlugin = (store) => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setSize') {
            // listening to screen size change to decide if we should switch UI mode too
            let wantedUiMode
            if (
                state.ui.width < BREAKPOINT_PHONE_WIDTH ||
                state.ui.height < BREAKPOINT_PHONE_HEIGHT
            ) {
                wantedUiMode = UIModes.PHONE
            } else {
                // so the UI mode DESKTOP also includes the tablet mode.
                wantedUiMode = UIModes.DESKTOP
            }
            if (wantedUiMode !== state.ui.mode) {
                store.dispatch('setUiMode', wantedUiMode)
                if (
                    (wantedUiMode === UIModes.PHONE && state.ui.floatingTooltip) ||
                    (wantedUiMode === UIModes.DESKTOP && !state.ui.floatingTooltip)
                ) {
                    store.dispatch('toggleFloatingTooltip')
                }
            }
        }
    })
}

export default screenSizeManagementPlugin
