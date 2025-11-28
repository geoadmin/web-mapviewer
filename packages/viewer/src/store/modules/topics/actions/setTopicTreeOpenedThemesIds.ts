import type { TopicsStore } from '@/store/modules/topics/types/topics'
import type { ActionDispatcher } from '@/store/types'

export default function setTopicTreeOpenedThemesIds(
    this: TopicsStore,
    themes: string | string[],
    dispatcher: ActionDispatcher
): void {
    if (typeof themes === 'string') {
        this.openedTreeThemesIds = [...new Set(themes.split(','))]
    } else if (Array.isArray(themes)) {
        this.openedTreeThemesIds = [...new Set(themes)]
    }
}
