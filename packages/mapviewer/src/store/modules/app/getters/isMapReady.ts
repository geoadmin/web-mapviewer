import type { AppStore } from '@/store/modules/app/types'

export default function isMapReady(this: AppStore): boolean {
    return this.appState.name === 'MAP_SHOWN'
}
