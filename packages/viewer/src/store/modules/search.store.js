import { constants, coordinatesUtils, extentUtils, LV03 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import GeoJSON from 'ol/format/GeoJSON'

import getFeature from '@/api/features/features.api'
import LayerFeature from '@/api/features/LayerFeature.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import reframe from '@/api/lv03Reframe.api'
import search, { SearchResultTypes } from '@/api/search.api'
import { isWhat3WordsString, retrieveWhat3WordsLocation } from '@/api/what3words.api'
import { FeatureInfoPositions } from '@/store/modules/ui.store'
import coordinateFromString from '@/utils/coordinates/coordinateExtractors'
import { parseGpx } from '@/utils/gpxUtils'
import { parseKml } from '@/utils/kmlUtils'

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

    /**
     * If true, the first search result will be automatically selected
     *
     * @type {Boolean}
     */
    autoSelect: false,
}

const getters = {}

/**
 * Returns the appropriate result for autoselection from a list of search results.
 *
 * If there is only one result, it returns that result. Otherwise, it tries to find a result with
 * the resultType of LOCATION. If such a result is found, it returns that result. If no result with
 * resultType LOCATION is found, it returns the first result in the list.
 *
 * @param {SearchResult[]} results - The list of search results.
 * @returns {SearchResult} - The selected search result for autoselection.
 */
function getResultForAutoselect(results) {
    if (results.length === 1) {
        return results[0]
    }
    // Try to find a result with resultType LOCATION
    const locationResult = results.find(
        (result) => result.resultType === SearchResultTypes.LOCATION
    )

    // If a location result is found, return it; otherwise, return the first result
    return locationResult ?? results[0]
}

const actions = {
    setAutoSelect: ({ commit }, { value = false, dispatcher }) => {
        commit('setAutoSelect', { value, dispatcher })
    },

    /**
     * @param {vuex} vuex
     * @param {Object} payload
     * @param {String} payload.query
     */
    setSearchQuery: async (
        { commit, rootState, dispatch, getters },
        { query = '', originUrlParam = false, dispatcher }
    ) => {
        let results = []
        commit('setSearchQuery', { query, dispatcher })
        // only firing search if query is longer than or equal to 2 chars
        if (query.length >= 2) {
            const currentProjection = rootState.position.projection
            // checking first if this corresponds to a set of coordinates (or a what3words)
            const extractedCoordinate = coordinateFromString(query)
            let what3wordLocation = null
            if (!extractedCoordinate && isWhat3WordsString(query)) {
                try {
                    what3wordLocation = await retrieveWhat3WordsLocation(query, currentProjection)
                } catch (error) {
                    log.info(
                        `Query "${query}" is not a valid What3Words, fallback to service search`,
                        error
                    )
                    what3wordLocation = null
                }
            }

            if (extractedCoordinate) {
                let coordinates = [...extractedCoordinate.coordinate]
                if (extractedCoordinate.coordinateSystem !== currentProjection) {
                    // special case for LV03 input, we can't use proj4 to transform them into
                    // LV95 or others, as the deformation between LV03 and the others is not constant.
                    // So we pass through a LV95 reframe (done by a backend service that knows all deformations between the two)
                    // and then go to the wanted coordinate system
                    if (extractedCoordinate.coordinateSystem === LV03) {
                        coordinates = await reframe({
                            inputProjection: LV03,
                            inputCoordinates: coordinates,
                            outputProjection: currentProjection,
                        })
                    } else {
                        coordinates = coordinatesUtils.reprojectAndRound(
                            extractedCoordinate.coordinateSystem,
                            currentProjection,
                            coordinates
                        )
                    }
                }
                const dispatcherCoordinate = `${dispatcher}/search.store/setSearchQuery/coordinate`
                dispatch('setCenter', {
                    center: coordinates,
                    dispatcher: dispatcherCoordinate,
                })
                if (!currentProjection.usesMercatorPyramid) {
                    dispatch('setZoom', {
                        zoom: currentProjection.transformStandardZoomLevelToCustom(
                            constants.STANDARD_ZOOM_LEVEL_1_25000_MAP
                        ),
                        dispatcher: dispatcherCoordinate,
                    })
                } else {
                    dispatch('setZoom', {
                        zoom: constants.STANDARD_ZOOM_LEVEL_1_25000_MAP,
                        dispatcher: dispatcherCoordinate,
                    })
                }
                dispatch('setPinnedLocation', { coordinates, dispatcher: dispatcherCoordinate })
            } else if (what3wordLocation) {
                const dispatcherWhat3words = `${dispatcher}/search.store/setSearchQuery/what3words`
                dispatch('setCenter', {
                    center: what3wordLocation,
                    dispatcher: dispatcherWhat3words,
                })
                if (!currentProjection.usesMercatorPyramid) {
                    dispatch('setZoom', {
                        zoom: currentProjection.transformStandardZoomLevelToCustom(
                            constants.STANDARD_ZOOM_LEVEL_1_25000_MAP
                        ),
                        dispatcher: dispatcherWhat3words,
                    })
                } else {
                    dispatch('setZoom', {
                        zoom: constants.STANDARD_ZOOM_LEVEL_1_25000_MAP,
                        dispatcher: dispatcherWhat3words,
                    })
                }
                dispatch('setPinnedLocation', {
                    coordinates: what3wordLocation,
                    dispatcher: dispatcherWhat3words,
                })
            } else {
                try {
                    results = await search({
                        outputProjection: currentProjection,
                        queryString: query,
                        lang: rootState.i18n.lang,
                        layersToSearch: getters.visibleLayers,
                        limit: state.autoSelect ? 1 : null,
                    })
                    if (
                        (originUrlParam && results.length === 1) ||
                        (originUrlParam && state.autoSelect && results.length >= 1)
                    ) {
                        dispatch('selectResultEntry', {
                            dispatcher: `${dispatcher}/setSearchQuery`,
                            entry: getResultForAutoselect(results),
                        })
                    }
                } catch (error) {
                    log.error(`Search failed`, error)
                }
            }
        } else if (query.length === 0) {
            dispatch('clearPinnedLocation', { dispatcher: `${dispatcher}/setSearchQuery` })
        }
        commit('setSearchResults', { results, dispatcher: `${dispatcher}/setSearchQuery` })
    },
    /**
     * @param commit
     * @param dispatch
     * @param {SearchResult} entry
     */
    selectResultEntry: async ({ dispatch, getters, rootState, commit }, { entry, dispatcher }) => {
        const dispatcherSelectResultEntry = `${dispatcher}/search.store/selectResultEntry`
        switch (entry.resultType) {
            case SearchResultTypes.LAYER:
                if (getters.getActiveLayersById(entry.layerId, false).length === 0) {
                    dispatch('addLayer', {
                        layerConfig: { id: entry.layerId, visible: true },
                        dispatcher: dispatcherSelectResultEntry,
                    })
                } else {
                    dispatch('updateLayers', {
                        layers: [{ id: entry.layerId, visible: true }],
                        dispatcher: dispatcherSelectResultEntry,
                    })
                }
                // launching a new search to get (potential) layer features
                try {
                    const resultIncludingLayerFeatures = await search({
                        outputProjection: rootState.position.projection,
                        queryString: state.query,
                        lang: rootState.i18n.lang,
                        layersToSearch: getters.visibleLayers,
                        limit: state.autoSelect ? 1 : null,
                    })
                    if (resultIncludingLayerFeatures.length > state.results.length) {
                        commit('setSearchResults', {
                            results: resultIncludingLayerFeatures,
                            ...dispatcher,
                        })
                    }
                } catch (error) {
                    log.error(`Search failed`, error)
                }
                break
            case SearchResultTypes.LOCATION:
                zoomToEntry(entry, dispatch, dispatcher, dispatcherSelectResultEntry)
                dispatch('setPinnedLocation', {
                    coordinates: entry.coordinate,
                    dispatcher: dispatcherSelectResultEntry,
                })
                break
            case SearchResultTypes.FEATURE:
                zoomToEntry(entry, dispatch, dispatcher, dispatcherSelectResultEntry)

                // Automatically select the feature
                try {
                    if (entry.layer.getTopicForIdentifyAndTooltipRequests) {
                        getFeature(entry.layer, entry.featureId, rootState.position.projection, {
                            lang: rootState.i18n.lang,
                            screenWidth: rootState.ui.width,
                            screenHeight: rootState.ui.height,
                            mapExtent: extentUtils.flattenExtent(getters.extent),
                            coordinate: entry.coordinate,
                        }).then((feature) => {
                            dispatch('setSelectedFeatures', {
                                features: [feature],
                                dispatcher,
                            })
                            dispatch('setFeatureInfoPosition', {
                                position: FeatureInfoPositions.TOOLTIP,
                                ...dispatcher,
                            })
                        })
                    } else {
                        // For imported KML and GPX files
                        let features = []
                        if (entry.layer.type === LayerTypes.KML) {
                            features = parseKml(entry.layer, rootState.position.projection, [])
                        }
                        if (entry.layer.type === LayerTypes.GPX) {
                            features = parseGpx(
                                entry.layer.gpxData,
                                rootState.position.projection,
                                []
                            )
                        }
                        const layerFeatures = features
                            .map((feature) => createLayerFeature(feature, entry.layer))
                            .filter((feature) => !!feature && feature.data.title === entry.title)
                        dispatch('setSelectedFeatures', {
                            features: layerFeatures,
                            dispatcher,
                        })
                        dispatch('setFeatureInfoPosition', {
                            position: FeatureInfoPositions.TOOLTIP,
                            ...dispatcher,
                        })
                    }
                } catch (error) {
                    log.error('Error getting feature:', error)
                }

                break
        }
        if (entry.resultType === SearchResultTypes.LOCATION) {
            commit('setSearchQuery', { query: entry.sanitizedTitle.trim(), dispatcher })
        }
        if (state.autoSelect) {
            dispatch('setAutoSelect', {
                value: false,
                dispatcher: dispatcherSelectResultEntry,
            })
        }
    },
}

function createLayerFeature(olFeature, layer) {
    if (!olFeature.getGeometry()) return null
    return new LayerFeature({
        layer: layer,
        id: olFeature.getId(),
        title:
            olFeature.get('label') ??
            // exception for MeteoSchweiz GeoJSONs, we use the station name instead of the ID
            // some of their layers are
            // - ch.meteoschweiz.messwerte-niederschlag-10min
            // - ch.meteoschweiz.messwerte-lufttemperatur-10min
            olFeature.get('station_name') ??
            // GPX track feature don't have an ID but have a name !
            olFeature.get('name') ??
            olFeature.getId(),
        data: {
            title: olFeature.get('name'),
            description: olFeature.get('description'),
        },
        coordinates: olFeature.getGeometry().getCoordinates(),
        geometry: new GeoJSON().writeGeometryObject(olFeature.getGeometry()),
        extent: extentUtils.normalizeExtent(olFeature.getGeometry().getExtent()),
    })
}

const mutations = {
    setAutoSelect: (state, { value }) => (state.autoSelect = value),
    setSearchQuery: (state, { query }) => (state.query = query),
    setSearchResults: (state, { results }) => (state.results = results ?? []),
}

export default {
    state,
    getters,
    actions,
    mutations,
}

function zoomToEntry(entry, dispatch, dispatcher, dispatcherSelectResultEntry) {
    if (entry.extent?.length === 2) {
        dispatch('zoomToExtent', { extent: entry.extent, dispatcher })
    } else if (entry.zoom) {
        dispatch('setCenter', {
            center: entry.coordinate,
            dispatcher: dispatcherSelectResultEntry,
        })
        dispatch('setZoom', {
            zoom: entry.zoom,
            dispatcher: dispatcherSelectResultEntry,
        })
    }
}
