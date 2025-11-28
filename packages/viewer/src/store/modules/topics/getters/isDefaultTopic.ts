import type { TopicsStore } from '@/store/modules/topics/types/topics'

export default function isDefaultTopic(this: TopicsStore): boolean {
    return this.current === 'ech'
}
