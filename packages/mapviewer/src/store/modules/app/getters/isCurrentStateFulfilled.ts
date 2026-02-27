import type { AppStore } from '@/store/modules/app/types'

export default function isCurrentStateFulfilled(this: AppStore) {
    return this.appState.isFulfilled()
}
