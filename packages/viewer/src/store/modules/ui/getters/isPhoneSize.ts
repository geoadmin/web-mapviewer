import type { UIStore } from '@/store/modules/ui/types/ui'

export default function isPhoneSize(this: UIStore): boolean {
    return this.isPhoneMode
}
