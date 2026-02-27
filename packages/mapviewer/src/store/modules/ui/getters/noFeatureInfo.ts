import type { UIStore } from '@/store/modules/ui/types'

export default function noFeatureInfo(this: UIStore): boolean {
    return this.featureInfoPosition === 'none'
}
