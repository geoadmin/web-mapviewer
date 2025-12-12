import type { Topic } from '@/api/topics.api'
import type { TopicsStore } from '@/store/modules/topics/types'

export default function currentTopic(this: TopicsStore): Topic | undefined {
    return this.config.find((topic) => topic.id === this.current)
}
