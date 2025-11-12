import { defineStore } from 'pinia'

import type { AppStoreGetters, AppStoreState } from '@/store/modules/app/types/app'

import nextState from '@/store/modules/app/actions/nextState'
import setHasPendingUrlParsing from '@/store/modules/app/actions/setHasPendingUrlParsing'
import isConfigLoaded from '@/store/modules/app/getters/isConfigLoaded'
import isCurrentStateFulfilled from '@/store/modules/app/getters/isCurrentStateFulfilled'
import isLoadingConfig from '@/store/modules/app/getters/isLoadingConfig'
import isMapReady from '@/store/modules/app/getters/isMapReady'
import isParsingLegacy from '@/store/modules/app/getters/isParsingLegacy'
import isReady from '@/store/modules/app/getters/isReady'
import isSyncingStore from '@/store/modules/app/getters/isSyncingStore'
import { type AppState, AppStateNames } from '@/store/modules/app/types/appState'
import useLayersStore from '@/store/modules/layers'
import useTopicsStore from '@/store/modules/topics'
import useUIStore from '@/store/modules/ui'
import { isLegacyParams } from '@/utils/legacyLayerParamUtils'

const mapShown: AppState = {
    name: AppStateNames.MapShown,
    isFulfilled: () => false, // never fulfilled, last state
    next: () => mapShown,
}

const ready: AppState = {
    name: AppStateNames.Ready,
    isFulfilled: () => true,
    next: () => mapShown,
}

const syncingStore: AppState = {
    name: AppStateNames.SyncingStore,
    isFulfilled: () => true, // TODO: check that route query is in sync with store
    next: () => {
        return ready
    },
}

const legacyParsing: AppState = {
    name: AppStateNames.LegacyParsing,
    isFulfilled: () => !isLegacyParams(window?.location?.search),
    next: () => {
        return syncingStore
    },
}

const configLoaded: AppState = {
    name: AppStateNames.ConfigLoaded,
    isFulfilled: () => true, // there's always a topic set, so no need to check if topicStore.current is defined
    next: () => {
        if (isLegacyParams(window?.location?.search)) {
            return legacyParsing
        }
        return syncingStore
    },
}

const initializing: AppState = {
    name: AppStateNames.Initializing,
    isFulfilled: () => {
        const layersStore = useLayersStore()
        const topicsStore = useTopicsStore()
        const uiStore = useUIStore()

        return (
            layersStore.config.length > 0 &&
            topicsStore.config.length > 0 &&
            uiStore.width > 0 &&
            uiStore.height > 0
        )
    },
    next: () => configLoaded,
}

const state = (): AppStoreState => ({
    appState: initializing,
    hasPendingUrlParsing: false,
})

const getters: AppStoreGetters = {
    isCurrentStateFulfilled,
    isLoadingConfig,
    isConfigLoaded,
    isParsingLegacy,
    isSyncingStore,
    isReady,
    isMapReady,
}

const actions = {
    nextState,
    setHasPendingUrlParsing,
}

const useAppStore = defineStore('app', {
    state,
    getters: { ...getters },
    actions,
})

export default useAppStore
