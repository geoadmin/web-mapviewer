import type { Topic } from '@/api/topics.api'
import type { LoadTopicOptions, TopicsStore } from '@/store/modules/topics/types/topics'
import type { ActionDispatcher } from '@/store/types'

export default function setTopics(this: TopicsStore, topics: Topic[], options: LoadTopicOptions, dispatcher: ActionDispatcher): void {
    this.config = [...topics]
    this.loadTopic(options, dispatcher)
}
