import search, {CombinedSearchResults, RESULT_TYPE} from "@/api/search.api";
import { coordinateFromString } from "@/utils/coordinateUtils";
import {ZOOM_LEVEL_1_25000_MAP} from "@/modules/store/modules/position.store";
import {isWhat3WordsString, retrieveWhat3WordsLocation} from "@/api/what3words.api";

const state = {
    pending: false,
    query: '',
    results: new CombinedSearchResults(),
    show: false
};

const getters = {};

const actions = {
    /**
     * @param {vuex} vuex
     * @param {Object} payload
     * @param {String} payload.query
     * @param {Boolean} payload.showResultsAfterRequest
     */
    setSearchQuery: ({ commit, rootState, dispatch }, {query = '', showResultsAfterRequest = true}) => {
        commit('setSearchQuery', query);
        commit('setSearchResults', new CombinedSearchResults())
        // only firing search if query is longer than 2 chars
        if (query.length > 2) {
            // checking first if this corresponds to a set of coordinates (or a what3words)
            const coordinate = coordinateFromString(query);
            if (coordinate) {
                dispatch('setCenter', coordinate);
                dispatch('setZoom', ZOOM_LEVEL_1_25000_MAP);
                dispatch('highlightLocation', {
                    id: 'search-coordinates',
                    coordinate,
                });
            } else if (isWhat3WordsString(query)) {
                retrieveWhat3WordsLocation(query).then(what3wordLocation => {
                    dispatch('setCenter', what3wordLocation);
                    dispatch('setZoom', ZOOM_LEVEL_1_25000_MAP);
                    dispatch('highlightLocation', {
                        id: 'w3w-coordinates',
                        coordinate: what3wordLocation,
                    });
                })
            } else {
                search(query, rootState.i18n.lang).then(searchResults => {
                    if (searchResults) {
                        commit('setSearchResults', searchResults);
                        if (showResultsAfterRequest && searchResults.count() > 0) {
                            commit('showSearchResults')
                        }
                    }
                })
            }
        }
    },
    setSearchResults: ({ commit }, results) => commit('setSearchResults', results),
    showSearchResults: ({commit}) => commit('showSearchResults'),
    hideSearchResults: ({commit}) => commit('hideSearchResults'),
    /**
     * @param {vuex} vuex
     * @param {SearchResult|LayerSearchResult|FeatureSearchResult} entry
     */
    selectResultEntry: ({ commit, dispatch }, entry) => {
        switch (entry.resultType) {
            case RESULT_TYPE.LAYER:
                dispatch('addLayer', entry.layerId)
                break;
            case RESULT_TYPE.LOCATION:
                if (entry.extent.length === 2) {
                    dispatch('setExtent', entry.extent);
                }
                dispatch('highlightLocation', {
                    id: entry.featureId || entry.description,
                    coordinate: entry.coordinates,
                    name: entry.title
                })
                break;
        }
        commit('hideSearchResults');
    }
};

const mutations = {
    setSearchQuery: (state, query) => state.query = query,
    setSearchResults: (state, results) => state.results = results ? results : [],
    showSearchResults: state => state.show = true,
    hideSearchResults: state => state.show = false
};

export default {
    state,
    getters,
    actions,
    mutations
};
