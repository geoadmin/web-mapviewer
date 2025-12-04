import type { UIStore } from '@/store/modules/ui/types'

export default function showFeatureInfoInBottomPanel(this: UIStore): boolean {
    return (
        this.featureInfoPosition === 'bottompanel' ||
        (this.featureInfoPosition === 'default' && this.isPhoneMode)
    )
}
