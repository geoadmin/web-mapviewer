import type { UIStore } from '@/store/modules/ui/types/ui'

export default function screenDensity(this: UIStore): number {
    if (this.height === 0) {
        return 0
    }
    return this.width / this.height
}
