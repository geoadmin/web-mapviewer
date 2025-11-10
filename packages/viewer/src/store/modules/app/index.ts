import { defineStore } from 'pinia'

import setAppIsReady from '@/store/modules/app/actions/setAppIsReady'
import setAppState from '@/store/modules/app/actions/setAppState'
import setMapModuleReady from '@/store/modules/app/actions/setMapModuleReady'
import isReady from '@/store/modules/app/getters/isReady'
import { AppStates, type AppStoreGetters, type AppStoreState } from '@/store/modules/app/types/app'

const state = (): AppStoreState => ({
    appState: AppStates.Initializing,
    isMapReady: false,
})

const getters: AppStoreGetters = {
    isReady,
}

const actions = {
    setAppIsReady,
    setAppState,
    setMapModuleReady,
}

const useAppStore = defineStore('app', {
    state,
    getters: {...getters},
    actions,
})

export default useAppStore
