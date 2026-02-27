import type { TopicsStore } from '@/store/modules/topics/types'

export default function isDefaultTopic(this: TopicsStore): boolean {
    return this.current === 'ech'
}
