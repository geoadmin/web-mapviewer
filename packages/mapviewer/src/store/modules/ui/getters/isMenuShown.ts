import type { UIStore } from '@/store/modules/ui/types'

export default function isMenuShown(this: UIStore): boolean {
    return this.isHeaderShown && this.showMenu
}
