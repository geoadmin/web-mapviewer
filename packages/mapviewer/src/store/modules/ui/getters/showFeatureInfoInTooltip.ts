import type { UIStore } from '@/store/modules/ui/types'

export default function showFeatureInfoInTooltip(this: UIStore): boolean {
    return (
        this.featureInfoPosition === 'tooltip' ||
        (this.featureInfoPosition === 'default' && !this.isPhoneMode)
    )
}
