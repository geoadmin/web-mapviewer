import axios from 'axios'
import { IS_TESTING_WITH_CYPRESS } from '@/config'

/** Vuex module that tells if the app has finished loading (is ready to show stuff) */
export default {
    state: {
        /**
         * Flag that tells if the app is ready to show data and the map
         *
         * @type Boolean
         */
        isReady: false,
    },
    getters: {},
    actions: {
        setAppIsReady: ({ commit }) => {
            commit('setAppIsReady')
            // in case we are testing with Cypress, we trigger a fake request to
            // a localhost endpoint so that Cypress can intercept it and know the
            // app is done loading
            if (IS_TESTING_WITH_CYPRESS) {
                axios.get('/tell-cypress-app-is-done-loading')
            }
        },
    },
    mutations: {
        setAppIsReady: (state) => (state.isReady = true),
    },
}
