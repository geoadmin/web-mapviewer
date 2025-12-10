import { defineStore } from 'pinia'

import type { AppStoreGetters, AppStoreState } from '@/store/modules/app/types/app'

import nextState from '@/store/modules/app/actions/nextState'
import setHasPendingUrlParsing from '@/store/modules/app/actions/setHasPendingUrlParsing'
import setInitialUrlParsingHasHappened from '@/store/modules/app/actions/setInitialUrlParsingHasHappened'
import setLegacyUrlParsingHasHappened from '@/store/modules/app/actions/setLegacyUrlParsingHasHappened'
import isConfigLoaded from '@/store/modules/app/getters/isConfigLoaded'
import isCurrentStateFulfilled from '@/store/modules/app/getters/isCurrentStateFulfilled'
import isLoadingConfig from '@/store/modules/app/getters/isLoadingConfig'
import isMapReady from '@/store/modules/app/getters/isMapReady'
import isParsingLegacy from '@/store/modules/app/getters/isParsingLegacy'
import isParsingUrl from '@/store/modules/app/getters/isParsingUrl'
import isReady from '@/store/modules/app/getters/isReady'
import { type AppState, AppStateNames } from '@/store/modules/app/types/appState'
import useCesiumStore from '@/store/modules/cesium'
import useLayersStore from '@/store/modules/layers'
import useMapStore from '@/store/modules/map'
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
    isFulfilled: () => {
        const mapStore = useMapStore()
        const cesiumStore = useCesiumStore()
        if (cesiumStore.active) {
            return cesiumStore.isViewerReady
        }
        return mapStore.hasBeenLoaded
    },
    next: () => mapShown,
}

const initiateUrlParsing: AppState = {
    name: AppStateNames.UrlParsing,
    isFulfilled: () => {
        return useAppStore().initialUrlParsingHasHappened
    },
    next: () => {
        return ready
    },
}

const parseLegacyUrlParams: AppState = {
    name: AppStateNames.LegacyParsing,
    // legacyUrlParsingHasHappened is necessary to reevaluate after the legacy parsing has happened, without it, 
    // isFulfilled would always return false/true after the first time
    // it also has to be the first condition because the && operator is short-circuiting
    isFulfilled: () => useAppStore().legacyUrlParsingHasHappened && !isLegacyParams(window?.location?.search),
    next: () => {
        return initiateUrlParsing
    },
}

const configLoaded: AppState = {
    name: AppStateNames.ConfigLoaded,
    isFulfilled: () => true, // there's always a topic set, so no need to check if topicStore.current is defined
    next: () => {
        if (isLegacyParams(window?.location?.search)) {
            return parseLegacyUrlParams
        }
        return initiateUrlParsing
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
    initialUrlParsingHasHappened: false,
    hasPendingUrlParsing: false,
    legacyUrlParsingHasHappened: false,
})

const getters: AppStoreGetters = {
    isCurrentStateFulfilled,
    isLoadingConfig,
    isConfigLoaded,
    isParsingLegacy,
    isParsingUrl,
    isReady,
    isMapReady,
}

const actions = {
    nextState,
    setHasPendingUrlParsing,
    setInitialUrlParsingHasHappened,
    setLegacyUrlParsingHasHappened,
}

const useAppStore = defineStore('app', {
    state,
    getters: { ...getters },
    actions,
})

export default useAppStore
