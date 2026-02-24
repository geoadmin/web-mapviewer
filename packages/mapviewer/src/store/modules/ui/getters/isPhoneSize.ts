import type { UIStore } from '@/store/modules/ui/types'

export default function isPhoneSize(this: UIStore): boolean {
    return this.isPhoneMode
}
