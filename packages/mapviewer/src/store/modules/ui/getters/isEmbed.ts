import type { UIStore } from '@/store/modules/ui/types'

export default function isEmbed(this: UIStore): boolean {
    return this.embed
}
