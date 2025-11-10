import { defineStore } from 'pinia'

import setAppIsReady from '@/store/modules/app/actions/setAppIsReady'
import setAppState from '@/store/modules/app/actions/setAppState'
import setMapModuleReady from '@/store/modules/app/actions/setMapModuleReady'
import isConfigLoaded from '@/store/modules/app/getters/isConfigLoaded'
import isLoadingConfig from '@/store/modules/app/getters/isLoadingConfig'
import isParsingLegacy from '@/store/modules/app/getters/isParsingLegacy'
import isReady from '@/store/modules/app/getters/isReady'
import isSyncingStore from '@/store/modules/app/getters/isSyncingStore'
import { AppStates, type AppStoreGetters, type AppStoreState } from '@/store/modules/app/types/app'

const state = (): AppStoreState => ({
    appState: AppStates.Initializing,
    isMapReady: false,
})

const getters: AppStoreGetters = {
    isLoadingConfig,
    isConfigLoaded,
    isParsingLegacy,
    isSyncingStore,
    isReady,
}

const actions = {
    setAppState,
    setMapModuleReady,
}

const useAppStore = defineStore('app', {
    state,
    getters: {...getters},
    actions,
})

export default useAppStore
