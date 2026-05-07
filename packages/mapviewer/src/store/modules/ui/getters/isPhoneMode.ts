import type { UIStore } from '@/store/modules/ui/types'

export default function isPhoneMode(this: UIStore): boolean {
    return this.mode === 'phone'
}
