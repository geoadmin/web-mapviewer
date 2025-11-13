import type { TopicsStore } from '@/store/modules/topics/types/topics'
import type { ActionDispatcher } from '@/store/types'

export default function addTopicTreeOpenedThemeId(
    this: TopicsStore,
    themeId: string,
    dispatcher: ActionDispatcher
): void {
    this.openedTreeThemesIds.push(themeId)
}
