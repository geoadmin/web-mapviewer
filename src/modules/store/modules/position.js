const state = {
    latitude: 46.97132,
    longitude: 7.44849,
    zoom: 8,
    minZoom: 2,
    maxZoom: 18
};

const getters = {
    center: state => [state.longitude, state.latitude],
    centerLatLng: state => [state.latitude, state.longitude]
};

const actions = {
    setZoom({commit}, zoom) {
        commit("setZoom", zoom);
    },
    increaseZoom({commit}) {
        commit("increaseZoom");
    },
    decreaseZoom({commit}) {
        commit("decreaseZoom");
    },
    setCenter({commit}, {latitude, longitude}) {
        commit("setCenter", {latitude, longitude});
    }
};

function setZoom(state, zoom) {
    if (zoom < state.minZoom) {
        state.zoom = state.minZoom;
    } else if (zoom > state.maxZoom) {
        state.zoom = state.maxZoom;
    } else {
        state.zoom = zoom;
    }
}

const mutations = {
    setZoom(state, zoom) {
        setZoom(state, zoom);
    },
    increaseZoom(state) {
        setZoom(state, state.zoom + 1)
    },
    decreaseZoom(state) {
        setZoom(state, state.zoom - 1)
    },
    setCenter(state, {latitude, longitude}) {
        state.latitude = latitude;
        state.longitude = longitude;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
