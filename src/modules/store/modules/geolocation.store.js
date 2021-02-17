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
     * @type Boolean
     */
    tracking: false,
    /**
     * Device position in EPSG:3857 (meters) [x, y]
     *
     * @type Array<Number>
     */
    position: [0, 0],
    /**
     * Accuracy of the geolocation position, in meters
     *
     * @type Number
     */
    accuracy: 0,
}

const getters = {}

const actions = {
    toggleGeolocation: ({ commit, state }) => {
        const willBeActive = !state.active
        if (willBeActive) {
            commit('setGeolocationTracking', true)
        }
        commit('setGeolocationActive', willBeActive)
    },
    setGeolocationTracking: ({ commit }, tracking) => commit('setGeolocationTracking', tracking),
    setGeolocationDenied: ({ commit }, denied) => {
        commit('setGeolocationDenied', denied)
        if (denied) {
            commit('setGeolocationActive', false)
            commit('setGeolocationTracking', false)
        }
    },
    setGeolocationPosition: ({ commit }, position) => {
        if (Array.isArray(position) && position.length === 2) {
            commit('setGeolocationPosition', position)
        } else {
            console.debug('Invalid geolocation position received, ignoring', position)
        }
    },
    setGeolocationAccuracy: ({ commit }, accuracy) => {
        if (Number.isInteger(accuracy)) {
            commit('setGeolocationAccuracy', Number(accuracy))
        }
    },
}

const mutations = {
    setGeolocationActive: (state, active) => (state.active = active),
    setGeolocationDenied: (state, denied) => (state.denied = denied),
    setGeolocationTracking: (state, tracking) => (state.tracking = tracking),
    setGeolocationAccuracy: (state, accuracy) => (state.accuracy = accuracy),
    setGeolocationPosition: (state, position) => (state.position = position),
}

export default {
    state,
    getters,
    actions,
    mutations,
}
