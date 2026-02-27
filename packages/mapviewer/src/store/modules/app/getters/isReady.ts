import type { AppStore } from '@/store/modules/app/types'

export default function isReady(this: AppStore): boolean {
    return this.appState.name === 'READY' || this.appState.name === 'MAP_SHOWN'
}
