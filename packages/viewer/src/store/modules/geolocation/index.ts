import { defineStore } from 'pinia'

import type {
    GeolocationStoreGetters,
    GeolocationStoreState,
} from '@/store/modules/geolocation/types/geolocation'

import setGeolocationAccuracy from '@/store/modules/geolocation/actions/setGeolocationAccuracy'
import setGeolocationActive from '@/store/modules/geolocation/actions/setGeolocationActive'
import setGeolocationDenied from '@/store/modules/geolocation/actions/setGeolocationDenied'
import setGeolocationPosition from '@/store/modules/geolocation/actions/setGeolocationPosition'
import setGeolocationTracking from '@/store/modules/geolocation/actions/setGeolocationTracking'
import toggleGeolocation from '@/store/modules/geolocation/actions/toggleGeolocation'

const state = (): GeolocationStoreState => ({
    active: false,
    denied: false,
    tracking: true,
    position: undefined,
    accuracy: 0,
    errorCount: 0,
    firstTime: true,
})

const getters: GeolocationStoreGetters = {}

const actions = {
    setGeolocationActive,
    toggleGeolocation,
    setGeolocationTracking,
    setGeolocationDenied,
    setGeolocationPosition,
    setGeolocationAccuracy,
}

const useGeolocationStore = defineStore('geolocation', {
    state,
    getters: { ...getters },
    actions,
})

export default useGeolocationStore
