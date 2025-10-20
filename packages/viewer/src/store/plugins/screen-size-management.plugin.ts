import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

import { BREAKPOINT_PHONE_HEIGHT, BREAKPOINT_PHONE_WIDTH } from '@/config/responsive.config'
import { UIStoreActions } from '@/store/actions'
import useUIStore, { UIModes } from '@/store/modules/ui.store'
import { isEnumValue } from '@/utils/utils'

const dispatcher: ActionDispatcher = { name: 'screen-size-management.plugin' }

const screenSizeManagement: PiniaPlugin = (context: PiniaPluginContext) => {
    const { store } = context

    store.$onAction(({ name }) => {
        if (isEnumValue<UIStoreActions>(UIStoreActions.SetSize, name)) {
            const uiStore = useUIStore()

            // listening to screen size change to decide if we should switch UI mode too
            let wantedUiMode

            if (
                uiStore.width < BREAKPOINT_PHONE_WIDTH ||
                uiStore.height < BREAKPOINT_PHONE_HEIGHT
            ) {
                wantedUiMode = UIModes.PHONE
            } else {
                // so the UI mode DESKTOP also includes the tablet mode.
                wantedUiMode = UIModes.DESKTOP
            }
            if (wantedUiMode !== uiStore.mode) {
                uiStore.setUiMode(wantedUiMode, dispatcher)
            }
        }
    })
}

export default screenSizeManagement
