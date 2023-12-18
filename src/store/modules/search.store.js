import search, { CombinedSearchResults, RESULT_TYPE } from '@/api/search.api'
import { isWhat3WordsString, retrieveWhat3WordsLocation } from '@/api/what3words.api'
import coordinateFromString from '@/utils/coordinates/coordinateExtractors'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import { STANDARD_ZOOM_LEVEL_1_25000_MAP } from '@/utils/coordinates/SwissCoordinateSystem.class'
import { ActiveLayerConfig } from '@/utils/layerUtils'
import log from '@/utils/logging'

const state = {
    /**
     * Flag telling if a search requesting is ongoing with the backend
     *
     * @type Boolean
     */
    pending: false,
    /**
     * The search query, will trigger a search to the backend if it contains 3 or more characters
     *
     * @type String
     */
    query: '',
    /**
     * Search results from the backend for the current query
     *
     * @type CombinedSearchResults
     */
    results: new CombinedSearchResults(),
}

const getters = {}

const actions = {
    /**
     * @param {vuex} vuex
     * @param {Object} payload
     * @param {String} payload.query
     */
    setSearchQuery: async ({ commit, rootState, dispatch }, { query = '' }) => {
        commit('setSearchQuery', query)
        let updatedSearchResults = false
        // only firing search if query is longer than or equal to 2 chars
        if (query.length >= 2) {
            const currentProjection = rootState.position.projection
            // checking first if this corresponds to a set of coordinates (or a what3words)
            const coordinate = coordinateFromString(query, currentProjection)
            if (coordinate) {
                dispatch('setCenter', coordinate)
                if (currentProjection instanceof CustomCoordinateSystem) {
                    dispatch(
                        'setZoom',
                        currentProjection.transformStandardZoomLevelToCustom(
                            STANDARD_ZOOM_LEVEL_1_25000_MAP
                        )
                    )
                } else {
                    dispatch('setZoom', STANDARD_ZOOM_LEVEL_1_25000_MAP)
                }
                dispatch('setPinnedLocation', coordinate)
            } else if (isWhat3WordsString(query)) {
                retrieveWhat3WordsLocation(query, currentProjection).then((what3wordLocation) => {
                    dispatch('setCenter', what3wordLocation)
                    if (currentProjection instanceof CustomCoordinateSystem) {
                        dispatch(
                            'setZoom',
                            currentProjection.transformStandardZoomLevelToCustom(
                                STANDARD_ZOOM_LEVEL_1_25000_MAP
                            )
                        )
                    } else {
                        dispatch('setZoom', STANDARD_ZOOM_LEVEL_1_25000_MAP)
                    }
                    dispatch('setPinnedLocation', what3wordLocation)
                })
            } else {
                try {
                    const searchResults = await search(
                        currentProjection,
                        query,
                        rootState.i18n.lang
                    )
                    if (searchResults) {
                        commit('setSearchResults', searchResults)
                        updatedSearchResults = true
                    }
                } catch (error) {
                    log.error(`Search failed`, error)
                }
            }
        } else if (query.length === 0) {
            dispatch('clearPinnedLocation')
        }
        if (!updatedSearchResults) {
            commit('setSearchResults', new CombinedSearchResults())
        }
    },
    setSearchResults: ({ commit }, results) => commit('setSearchResults', results),
    /**
     * @param commit
     * @param dispatch
     * @param {SearchResult | LayerSearchResult | FeatureSearchResult} entry
     */
    selectResultEntry: ({ commit, dispatch }, entry) => {
        switch (entry.resultType) {
            case RESULT_TYPE.LAYER:
                dispatch('addLayer', new ActiveLayerConfig(entry.layerId, true))
                break
            case RESULT_TYPE.LOCATION:
                if (entry.extent.length === 2) {
                    dispatch('zoomToExtent', entry.extent)
                } else if (entry.zoom) {
                    dispatch('setCenter', entry.coordinates)
                    dispatch('setZoom', entry.zoom)
                }
                dispatch('setPinnedLocation', entry.coordinates)
                break
        }
        commit('setSearchQuery', entry.getSimpleTitle())
    },
}

const mutations = {
    setSearchQuery: (state, query) => (state.query = query),
    setSearchResults: (state, results) => (state.results = results ? results : []),
}

export default {
    state,
    getters,
    actions,
    mutations,
}
