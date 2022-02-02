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
            }
        }
    })
}

export default screenSizeManagementPlugin
