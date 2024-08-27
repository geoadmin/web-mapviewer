import { BREAKPOINT_PHONE_HEIGHT, BREAKPOINT_PHONE_WIDTH } from '@/config/responsive.config'
import { UIModes } from '@/store/modules/ui.store'

const dispatcher = { dispatcher: 'screen-size-management.plugin' }

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
                store.dispatch('setUiMode', { mode: wantedUiMode, ...dispatcher })
            }
        }
    })
}

export default screenSizeManagementPlugin
