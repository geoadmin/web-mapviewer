import type { AppStore } from '@/store/modules/app/types'

export default function isLoadingConfig(this: AppStore): boolean {
    return this.appState.name === 'INITIALIZING'
}
