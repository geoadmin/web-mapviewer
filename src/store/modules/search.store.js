import search, { CombinedSearchResults, RESULT_TYPE } from '@/api/search.api'
import { isWhat3WordsString, retrieveWhat3WordsLocation } from '@/api/what3words.api'
import coordinateFromString from '@/utils/coordinates/coordinateExtractors'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import { STANDARD_ZOOM_LEVEL_1_25000_MAP } from '@/utils/coordinates/SwissCoordinateSystem.class'
import { ActiveLayerConfig } from '@/utils/layerUtils'
import log from '@/utils/logging'

const state = {
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
        let results = new CombinedSearchResults()
        commit('setSearchQuery', query)
        // only firing search if query is longer than or equal to 2 chars
        if (query.length >= 2) {
            const currentProjection = rootState.position.projection
            // checking first if this corresponds to a set of coordinates (or a what3words)
            const coordinate = coordinateFromString(query, currentProjection)
            if (coordinate) {
                const dispatcherCoordinate = 'search.store/setSearchQuery/coordinate'
                dispatch('setCenter', {
                    center: coordinate,
                    dispatcher: dispatcherCoordinate,
                })
                if (currentProjection instanceof CustomCoordinateSystem) {
                    dispatch('setZoom', {
                        zoom: currentProjection.transformStandardZoomLevelToCustom(
                            STANDARD_ZOOM_LEVEL_1_25000_MAP
                        ),
                        dispatcher: dispatcherCoordinate,
                    })
                } else {
                    dispatch('setZoom', {
                        zoom: STANDARD_ZOOM_LEVEL_1_25000_MAP,
                        dispatcher: dispatcherCoordinate,
                    })
                }
                dispatch('setPinnedLocation', coordinate)
            } else if (isWhat3WordsString(query)) {
                retrieveWhat3WordsLocation(query, currentProjection).then((what3wordLocation) => {
                    const dispatcherWhat3words = 'search.store/setSearchQuery/what3words'
                    dispatch('setCenter', {
                        center: what3wordLocation,
                        dispatcher: dispatcherWhat3words,
                    })
                    if (currentProjection instanceof CustomCoordinateSystem) {
                        dispatch('setZoom', {
                            zoom: currentProjection.transformStandardZoomLevelToCustom(
                                STANDARD_ZOOM_LEVEL_1_25000_MAP
                            ),
                            dispatcher: dispatcherWhat3words,
                        })
                    } else {
                        dispatch('setZoom', {
                            zoom: STANDARD_ZOOM_LEVEL_1_25000_MAP,
                            dispatcher: dispatcherWhat3words,
                        })
                    }
                    dispatch('setPinnedLocation', what3wordLocation)
                })
            } else {
                try {
                    results = await search(currentProjection, query, rootState.i18n.lang)
                } catch (error) {
                    log.error(`Search failed`, error)
                }
            }
        } else if (query.length === 0) {
            dispatch('clearPinnedLocation')
        }
        commit('setSearchResults', results)
    },
    setSearchResults: ({ commit }, results) => commit('setSearchResults', results),
    /**
     * @param commit
     * @param dispatch
     * @param {SearchResult | LayerSearchResult | FeatureSearchResult} entry
     */
    selectResultEntry: ({ dispatch }, entry) => {
        const dipsatcherSelectResultEntry = 'search.store/selectResultEntry'
        switch (entry.resultType) {
            case RESULT_TYPE.LAYER:
                dispatch('addLayer', {
                    layerConfig: new ActiveLayerConfig(entry.layerId, true),
                    dispatcher: dipsatcherSelectResultEntry,
                })
                break
            case RESULT_TYPE.LOCATION:
                if (entry.extent.length === 2) {
                    dispatch('zoomToExtent', { extent: entry.extent })
                } else if (entry.zoom) {
                    dispatch('setCenter', {
                        center: entry.coordinates,
                        dispatcher: dipsatcherSelectResultEntry,
                    })
                    dispatch('setZoom', {
                        zoom: entry.zoom,
                        dispatcher: dipsatcherSelectResultEntry,
                    })
                }
                dispatch('setPinnedLocation', entry.coordinates)
                break
        }
        dispatch('setSearchQuery', { query: entry.getSimpleTitle() })
    },
}

const mutations = {
    setSearchQuery: (state, query) => (state.query = query),
    setSearchResults: (state, results) =>
        (state.results = results ? results : new CombinedSearchResults()),
}

export default {
    state,
    getters,
    actions,
    mutations,
}
