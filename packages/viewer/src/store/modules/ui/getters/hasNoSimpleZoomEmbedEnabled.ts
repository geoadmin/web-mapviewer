import type { UIStore } from '@/store/modules/ui/types/ui'

export default function hasNoSimpleZoomEmbedEnabled(this: UIStore): boolean {
    return this.noSimpleZoomEmbed
}
