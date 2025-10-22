import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { Topic } from '@/api/topics.api'
import type { LoadTopicOptions, TopicsStore } from '@/store/modules/topics/types/topics'
import type { ActionDispatcher } from '@/store/types'

export default function changeTopic(this: TopicsStore, topicId: string, options: LoadTopicOptions, dispatcher: ActionDispatcher): void {
    if (
        this.config.some((topic: Topic) => topic.id === topicId) ||
        dispatcher.name === 'appLoadingManagement.routerPlugin'
    ) {
        this.current = topicId
        this.loadTopic(options, dispatcher)
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
