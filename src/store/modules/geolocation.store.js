import log from '@/utils/logging'
import { isNumber } from '@/utils/numberUtils'

const state = {
    /**
     * Flag telling if the user has activated the geolocation feature
     *
     * @type Boolean
     */
    active: false,

    /**
     * Flag telling if the geolocation usage has been denied by the user in his/her browser settings
     *
     * @type Boolean
     */
    denied: false,

    /**
     * Flag telling if the geolocation position should always be at the center of the app
     *
     * @type {Boolean}
     */
    tracking: true,

    /**
     * Device position in the current application projection [x, y]
     *
     * @type {Number[] | null}
     */
    position: null,

    /**
     * Accuracy of the geolocation position, in meters
     *
     * @type {Number}
     */
    accuracy: 0,
}

const getters = {}

const actions = {
    setGeolocation: ({ commit }, args) => {
        commit('setGeolocationActive', args)
    },
    toggleGeolocation: ({ commit, state }, { dispatcher }) => {
        const willBeActive = !state.active
        if (willBeActive) {
            commit('setGeolocationTracking', { tracking: true, dispatcher })
        }
        commit('setGeolocationActive', { active: willBeActive, dispatcher })
    },
    setGeolocationTracking: ({ commit }, args) => commit('setGeolocationTracking', args),
    setGeolocationDenied: ({ commit }, { denied, dispatcher }) => {
        commit('setGeolocationDenied', { denied, dispatcher })
        if (denied) {
            commit('setGeolocationActive', { active: false, dispatcher })
            commit('setGeolocationTracking', { tracking: false, dispatcher })
        }
    },
    setGeolocationPosition: ({ commit }, { position, dispatcher }) => {
        if (Array.isArray(position) && position.length === 2) {
            commit('setGeolocationPosition', { position, dispatcher })
        } else {
            log.debug('Invalid geolocation position received, ignoring', position)
        }
    },
    setGeolocationAccuracy: ({ commit }, { accuracy, dispatcher }) => {
        if (isNumber(accuracy)) {
            commit('setGeolocationAccuracy', { accuracy: Number(accuracy), dispatcher })
        } else {
            log.error(`Invalid geolocation accuracy: ${accuracy}`)
        }
    },
    setGeolocationData: ({ commit }, { position, accuracy, dispatcher }) => {
        commit('setGeolocationData', { position, accuracy, dispatcher })
    },
}

const mutations = {
    setGeolocationActive: (state, { active }) => (state.active = active),
    setGeolocationDenied: (state, { denied }) => (state.denied = denied),
    setGeolocationTracking: (state, { tracking }) => (state.tracking = tracking),
    setGeolocationAccuracy: (state, { accuracy }) => (state.accuracy = accuracy),
    setGeolocationPosition: (state, { position }) => (state.position = position),
    setGeolocationData: (state, { position, accuracy }) => {
        state.position = position
        state.accuracy = accuracy
    },
}

export default {
    state,
    getters,
    actions,
    mutations,
}
