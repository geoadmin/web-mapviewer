import type { AppStore } from '@/store/modules/app/types/app'

export default function isCurrentStateFulfilled(this: AppStore) {
    return this.appState.isFulfilled()
}
