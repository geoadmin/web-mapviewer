import type { UIStore } from '@/store/modules/ui/types/ui'

export default function isEmbed(this: UIStore): boolean {
    return this.embed
}
