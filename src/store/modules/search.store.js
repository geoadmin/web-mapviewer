import search, { SearchResultTypes } from '@/api/search.api'
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
     * @type {SearchResult[]}
     */
    results: [],
}

const getters = {}

const actions = {
    /**
     * @param {vuex} vuex
     * @param {Object} payload
     * @param {String} payload.query
     */
    setSearchQuery: async (
        { commit, rootState, dispatch, getters },
        { query = '', dispatcher }
    ) => {
        let results = []
        commit('setSearchQuery', { query, dispatcher })
        // only firing search if query is longer than or equal to 2 chars
        if (query.length >= 2) {
            const currentProjection = rootState.position.projection
            // checking first if this corresponds to a set of coordinates (or a what3words)
            const coordinates = coordinateFromString(query, currentProjection)
            if (coordinates) {
                const dispatcherCoordinate = `${dispatcher}/search.store/setSearchQuery/coordinate`
                dispatch('setCenter', {
                    center: coordinates,
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
                dispatch('setPinnedLocation', { coordinates, dispatcher: dispatcherCoordinate })
            } else if (isWhat3WordsString(query)) {
                retrieveWhat3WordsLocation(query, currentProjection).then((what3wordLocation) => {
                    const dispatcherWhat3words = `${dispatcher}/search.store/setSearchQuery/what3words`
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
                    dispatch('setPinnedLocation', {
                        coordinates: what3wordLocation,
                        dispatcher: dispatcherWhat3words,
                    })
                })
            } else {
                try {
                    results = await search({
                        outputProjection: currentProjection,
                        queryString: query,
                        lang: rootState.i18n.lang,
                        layersToSearch: getters.visibleLayers,
                    })
                } catch (error) {
                    log.error(`Search failed`, error)
                }
            }
        } else if (query.length === 0) {
            dispatch('clearPinnedLocation', { dispatcher: `${dispatcher}/setSearchQuery` })
        }
        commit('setSearchResults', { results, dispatcher: `${dispatcher}/setSearchQuery` })
    },
    setSearchResults: ({ commit }, { results, dispatcher }) =>
        commit('setSearchResults', { results, dispatcher }),
    /**
     * @param commit
     * @param dispatch
     * @param {SearchResult} entry
     */
    selectResultEntry: ({ dispatch, getters }, { entry, dispatcher }) => {
        const dipsatcherSelectResultEntry = `${dispatcher}/search.store/selectResultEntry`
        switch (entry.resultType) {
            case SearchResultTypes.LAYER:
                if (getters.getActiveLayersById(entry.layerId).length === 0) {
                    dispatch('addLayer', {
                        layerConfig: new ActiveLayerConfig(entry.layerId, true),
                        dispatcher: dipsatcherSelectResultEntry,
                    })
                } else {
                    dispatch('updateLayers', {
                        layers: [{ id: entry.layerId, visible: true }],
                        dispatcher: dipsatcherSelectResultEntry,
                    })
                }
                break
            case SearchResultTypes.LOCATION:
            case SearchResultTypes.FEATURE:
                if (entry.extent.length === 2) {
                    dispatch('zoomToExtent', { extent: entry.extent, dispatcher })
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
                dispatch('setPinnedLocation', {
                    coordinates: entry.coordinates,
                    dispatcher: dipsatcherSelectResultEntry,
                })
                break
        }
        dispatch('setSearchQuery', {
            query: entry.sanitizedTitle,
            dispatcher: dipsatcherSelectResultEntry,
        })
    },
}

const mutations = {
    setSearchQuery: (state, { query }) => (state.query = query),
    setSearchResults: (state, { results }) =>
        (state.results = results ? results : new CombinedSearchResults()),
}

export default {
    state,
    getters,
    actions,
    mutations,
}
