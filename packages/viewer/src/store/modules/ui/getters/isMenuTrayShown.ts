import type { UIStore } from '@/store/modules/ui/types'

export default function isMenuTrayShown(this: UIStore): boolean {
    return this.mode === 'phone' ? this.isMenuShown : this.isHeaderShown
}
