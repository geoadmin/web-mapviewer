import type { AppStore } from '@/store/modules/app/types'

export default function isReady(this: AppStore): boolean {
    return ['READY', 'MAP_SHOWN'].includes(this.appState.name)
}
