import type { PiniaPlugin } from 'pinia'

import { BREAKPOINT_PHONE_HEIGHT, BREAKPOINT_PHONE_WIDTH } from '@/config/responsive.config'
import useUIStore, { UIModes } from '@/store/modules/ui.store'

const dispatcher = { name: 'screen-size-management.plugin' }

/** @param store */
const screenSizeManagement: PiniaPlugin = () => {
    const uiStore = useUIStore()

    uiStore.$onAction(({ name, store }) => {
        if (name === 'setSize') {
            // listening to screen size change to decide if we should switch UI mode too
            let wantedUiMode

            if (store.width < BREAKPOINT_PHONE_WIDTH || store.height < BREAKPOINT_PHONE_HEIGHT) {
                wantedUiMode = UIModes.PHONE
            } else {
                // so the UI mode DESKTOP also includes the tablet mode.
                wantedUiMode = UIModes.DESKTOP
            }
            if (wantedUiMode !== store.mode) {
                store.setUiMode(wantedUiMode, dispatcher)
            }
        }
    })
}

export default screenSizeManagement
