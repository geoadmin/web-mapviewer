import type { TopicsStore } from '@/store/modules/topics/types/topics'
import type { ActionDispatcher } from '@/store/types'

export default function removeTopicTreeOpenedThemeId(
    this: TopicsStore,
    themeId: string,
    dispatcher: ActionDispatcher
): void {
    if (this.openedTreeThemesIds.includes(themeId)) {
        this.openedTreeThemesIds.splice(this.openedTreeThemesIds.indexOf(themeId), 1)
    }
}
