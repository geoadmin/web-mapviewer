import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { TopicsStore } from '@/store/modules/topics/types'
import type { ActionDispatcher } from '@/store/types'

interface ChangeTopicOptions {
    openGeocatalogSection?: boolean
}

export default function changeTopic(
    this: TopicsStore,
    topicId: string,
    dispatcher: ActionDispatcher
): void
export default function changeTopic(
    this: TopicsStore,
    topicId: string,
    options: ChangeTopicOptions,
    dispatcher: ActionDispatcher
): void
export default function changeTopic(
    this: TopicsStore,
    topicId: string,
    optionsOrDispatcher: ChangeTopicOptions | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
) {
    const dispatcher = dispatcherOrNothing ?? (optionsOrDispatcher as ActionDispatcher)
    const options = dispatcherOrNothing ? (optionsOrDispatcher as ChangeTopicOptions) : {}

    if (
        this.config.some((topic) => topic.id === topicId) ||
        dispatcher.name === 'appLoadingManagement.routerPlugin'
    ) {
        this.current = topicId
        this.loadTopic(
            {
                changeLayers: true,
                openGeocatalogSection: options.openGeocatalogSection,
                changeBackgroundLayer: true,
            },
            dispatcher
        )
    } else {
        log.error({
            title: 'Topics store',
            titleStyle: {
                backgroundColor: LogPreDefinedColor.Red,
            },
            messages: ['Invalid topic ID', topicId, dispatcher],
        })
    }
}
