import type { UIStore } from '@/store/modules/ui/types/ui'

export default function isMenuShown(this: UIStore): boolean {
    return this.isHeaderShown && this.showMenu
}
