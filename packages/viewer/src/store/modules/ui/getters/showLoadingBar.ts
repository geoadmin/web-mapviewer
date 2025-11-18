import type { UIStore } from '@/store/modules/ui/types/ui'

export default function showLoadingBar(this: UIStore): boolean {
    return Object.keys(this.loadingBarRequesters).length > 0
}
