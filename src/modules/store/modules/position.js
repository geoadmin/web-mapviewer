import {round} from "@/numberUtils";

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
    setZoom({commit, state}, zoom) {
        if (typeof zoom !== 'number') {
            return;
        }
        if (zoom < state.minZoom) {
            commit("setZoom", state.minZoom);
        } else if (zoom > state.maxZoom) {
            commit("setZoom", state.maxZoom);
        } else {
            commit("setZoom", round(zoom, 3));
        }
    },
    increaseZoom({dispatch, state}) {
        dispatch("setZoom", Number(state.zoom) + 1);
    },
    decreaseZoom({dispatch, state}) {
        dispatch("setZoom", Number(state.zoom) - 1);
    },
    setCenter({commit}, {latitude, longitude}) {
        commit("setCenter", {latitude, longitude});
    }
};

const mutations = {
    setZoom(state, zoom) {
        state.zoom = zoom;
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
