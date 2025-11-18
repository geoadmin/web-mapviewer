import type { UIStore } from '@/store/modules/ui/types/ui'

export default function isProductionSite(this: UIStore): boolean {
    return this.hostname === 'map.geo.admin.ch'
}
