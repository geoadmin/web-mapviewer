import { defineStore } from 'pinia'

import type { AppStoreGetters, AppStoreState } from '@/store/modules/app/types/app'

import setAppIsReady from '@/store/modules/app/actions/setAppIsReady'
import setMapModuleReady from '@/store/modules/app/actions/setMapModuleReady'

const state = (): AppStoreState => ({
    isReady: false,
    isMapReady: false,
})

const getters: AppStoreGetters = {}

const actions = {
    setAppIsReady,
    setMapModuleReady,
}

const useAppStore = defineStore('app', {
    state,
    getters: { ...getters },
    actions,
})

export default useAppStore
