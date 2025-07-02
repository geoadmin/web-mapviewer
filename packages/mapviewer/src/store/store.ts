import type EditableFeature from '@/api/features/EditableFeature.class.ts'
import type LayerFeature from '@/api/features/LayerFeature.class.ts'
import type SelectableFeature from '@/api/features/SelectableFeature.class.ts'

import { DrawingIconSet } from '@/api/icon.api.ts'

/**
 * To better keep track of who's the "trigger" of an action, each action comes attached with the
 * name of the component (or other part of the app) that triggered the action. This will be used to
 * log things.
 */
export interface ActionDispatcher {
    name: string
}

export interface ShareState {
    /**
     * Short link version of the current map position (and layers, and all...). This will not be
     * defined each time, but only when the share menu is opened first (it will then be updated
     * whenever the URL changes to match it)
     */
    shortLink: string | null
    /**
     * The state of the shortlink share menu section. As we need to be able to change this whenever
     * the user moves the map, and it should only be done within mutations.
     */
    isMenuSectionShown: boolean
}

export interface State {
    share: ShareState
}
