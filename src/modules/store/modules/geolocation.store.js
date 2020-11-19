const state = {
    active: false,
    denied: false,
    tracking: false,
    /** position in EPSG:3857 (meters) [x, y] */
    position: [0,0],
    /** accuracy of geolocation position in meters */
    accuracy: 0
};

const getters = {
};

const actions = {
    toggleGeolocation: ({commit, state}) => {
        const willBeActive = !state.active;
        if (willBeActive) {
            commit('setGeolocationTracking', true);
        }
        commit('setGeolocationActive', willBeActive)
    },
    setGeolocationTracking: ({commit}, tracking) => commit('setGeolocationTracking', tracking),
    setGeolocationDenied: ({commit}, denied) => {
        commit('setGeolocationDenied', denied)
        if (denied) {
            commit('setGeolocationActive', false)
            commit('setGeolocationTracking', false)
        }
    },
    setGeolocationPosition: ({commit}, position) => {
        if (Array.isArray(position) && position.length === 2) {
            commit('setGeolocationPosition', position);
        } else {
            console.debug('Invalid geolocation position received, ignoring', position);
        }
    },
    setGeolocationAccuracy: ({commit}, accuracy) => {
        if (Number.isInteger(accuracy)) {
            commit('setGeolocationAccuracy', Number(accuracy));
        }
    }
};

const mutations = {
    setGeolocationActive: (state, active) => state.active = active,
    setGeolocationDenied: (state, denied) => state.denied = denied,
    setGeolocationTracking: (state, tracking) => state.tracking = tracking,
    setGeolocationAccuracy: (state, accuracy) => state.accuracy = accuracy,
    setGeolocationPosition: (state, position) => state.position = position,
};

export default {
    state,
    getters,
    actions,
    mutations
};
