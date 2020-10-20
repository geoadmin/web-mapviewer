import axios from "axios";
import {API_BASE_URL} from "@/config";

function generateAxiosSearchRequest (query, lang, type) {
    return axios.get(`${API_BASE_URL}/2008121130/rest/services/ech/SearchServer`, {
        params: {
            sr: 3857,
            searchText: query.trim(),
            lang: lang || 'en',
            type: type || 'locations'
        }
    })
}

const state = {
    showMenuTray: false,
    search: {
        pending: false,
        query: '',
        results: {
            layers: [],
            locations: [],
            show: false
        }
    }
};

const getters = {};

const actions = {
    showMenuTray: ({commit}) => { commit('showMenuTray') },
    hideMenuTray: ({commit}) => { commit('hideMenuTray') },
    setSearchQuery: ({commit, rootState }, query) => {
        commit('setSearchQuery', query);
        commit('setSearchResults', {
            layers: [],
            locations: [],
            show: false
        })
        // only firing search if query is longer than 2 chars
        if (query.length > 2) {
            // combining the two types backend requests (locations and activeLayers) with axios
            axios.all([
                generateAxiosSearchRequest(query, rootState.i18n.lang, 'locations'),
                generateAxiosSearchRequest(query, rootState.i18n.lang, 'layers'),
            ]).then(responses => {
                const locationsResults = responses[0].data.results
                const layersResults = responses[1].data.results
                commit('setSearchResults', {
                    locations: [...locationsResults],
                    layers: [...layersResults],
                    show: locationsResults.length + layersResults.length > 0
                });
            });
        }
    },
    setSearchResults: ({ commit }, results) => commit('setSearchResults', results),
    showSearchResults: ({commit}) => commit('showSearchResults'),
    hideSearchResults: ({commit}) => commit('hideSearchResults'),
    selectResultEntry: ({ commit, dispatch }, entry) => {
        if (entry.attrs.layer) {
            dispatch('addLayer', entry.attrs.layer)
        } else if (entry.attrs.geom_st_box2d) {
            const linestringExtent = entry.attrs.geom_st_box2d;
            if (linestringExtent && linestringExtent.length > 0) {
                const matches = Array.from(linestringExtent.matchAll(/BOX\(([0-9\\.]+) ([0-9\\.]+),([0-9\\.]+) ([0-9\\.]+)\)/g))[0];
                const extent = {
                    bottomLeft: [ Number(matches[1]), Number(matches[2]) ],
                    topRight: [ Number(matches[3]), Number(matches[4]) ],
                }
                dispatch('setExtent', extent);
            }
            const featureId = entry.attrs.featureId || entry.attrs.detail;
            dispatch('highlightLocation', {
                id: featureId,
                coordinate: [entry.attrs.x, entry.attrs.y],
                name: entry.attrs.label
            })
        }
        commit('hideSearchResults');
    }
};

const mutations = {
    showMenuTray: state => state.showMenuTray = true,
    hideMenuTray: state => state.showMenuTray = false,
    setSearchQuery: (state, query) => state.search.query = query,
    setSearchResults: (state, results) => state.search.results = results ? results : [],
    showSearchResults: state => state.search.results.show = true,
    hideSearchResults: state => state.search.results.show = false
};

export default {
    state,
    getters,
    actions,
    mutations
};
