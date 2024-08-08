import { containsCoordinate } from 'ol/extent'
import { toRaw } from 'vue'

import EditableFeature, { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import getFeature, { identify, identifyOnGeomAdminLayer } from '@/api/features/features.api'
import LayerFeature from '@/api/features/LayerFeature.class'
import { sendFeatureInformationToIFrameParent } from '@/api/iframeFeatureEvent.api'
import getProfile from '@/api/profile/profile.api'
import {
    DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION,
    DEFAULT_FEATURE_COUNT_SINGLE_POINT,
} from '@/config.js'
import { flattenExtent } from '@/utils/coordinates/coordinateUtils'
import { allStylingColors, allStylingSizes } from '@/utils/featureStyleUtils'
import log from '@/utils/logging'

/** @param {SelectableFeature} feature */
export function canFeatureShowProfile(feature) {
    return (
        feature?.geometry?.type &&
        (['LineString', 'Polygon'].includes(feature.geometry.type) ||
            // if MultiLineString or MultiPolygon but only contains one "feature", that's fine too (mislabeled as "multi")
            (['MultiLineString', 'MultiPolygon'].includes(feature.geometry.type) &&
                feature.geometry.coordinates.length === 1))
    )
}

const getEditableFeatureWithId = (state, featureId) => {
    return state.selectedEditableFeatures.find(
        (selectedFeature) => selectedFeature.id === featureId
    )
}

function getFeatureCountForCoordinate(coordinate) {
    return coordinate.length === 2
        ? DEFAULT_FEATURE_COUNT_SINGLE_POINT
        : DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION
}

/**
 * Identifies feature at the given coordinates
 *
 * @param {AbstractLayer[]} config.layers
 * @param {[Number, Number] | [Number, Number, Number, Number]} config.coordinate Where to identify,
 *   either a single point, or an extent (expressed as [minX, maxY, minY, maxY])
 * @param {Number} config.resolution The current map resolution, in meter/pixel
 * @param {[Number, Number, Number, Number]} config.mapExtent The current map extent, described as
 *   [minX, maxX, minY, maxY]
 * @param {Number} config.screenWidth Current screen width (map width) in pixel
 * @param {Number} config.screenHeight Current screen height (map height) in pixel
 * @param {String} config.lang Current lang ISO code
 * @param {CoordinateSystem} config.projection Wanted projection with which to request the backend
 * @param {Number} [config.featureCount] How many features should be requested. If not given, will
 *   default to 10 for single coordinate, or 50 for extents.
 * @param {String | null} [config.api3UrlOverride=null] The base URL to access API3 services. If
 *   none is given, the default from config.js will be used. Default is `null`
 * @returns {Promise<LayerFeature[]>} A promise that will contain all feature identified by the
 *   different requests (won't be grouped by layer)
 */
const runIdentify = (config) => {
    const {
        layers,
        coordinate,
        resolution,
        mapExtent,
        screenWidth,
        screenHeight,
        lang,
        projection,
        featureCount,
        api3UrlOverride = null,
    } = config
    return new Promise((resolve, reject) => {
        const allFeatures = []
        const pendingRequests = []
        const commonParams = {
            coordinate,
            resolution,
            mapExtent,
            screenWidth,
            screenHeight,
            lang,
            projection,
            featureCount,
            api3UrlOverride,
        }
        // for each layer we run a backend request
        // NOTE: in theory for the Geoadmin layers we could run one single backend request to API3 instead of one per layer, however
        // this would not be more efficient as a single request would take more time that several in parallel (this has been tested).
        layers
            // only request layers that have getFeatureInfo capabilities (or are flagged has having a tooltip in their config for GeoAdmin layers)
            .filter((layer) => layer.hasTooltip)
            // filtering out any layer for which their extent doesn't contain the wanted coordinate (no data anyway, no need to request)
            .filter(
                (layer) =>
                    !layer.extent || containsCoordinate(flattenExtent(layer.extent), coordinate)
            )
            .forEach((layer) => {
                if (layer.layers) {
                    // for group of layers, we fire a request per sublayer
                    layer.layers.forEach((sublayer) => {
                        pendingRequests.push(
                            identify({
                                layer: sublayer,
                                ...commonParams,
                            })
                        )
                    })
                } else {
                    pendingRequests.push(
                        identify({
                            layer,
                            ...commonParams,
                        })
                    )
                }
            })
        // grouping all features from the different requests
        Promise.allSettled(pendingRequests)
            .then((responses) => {
                responses.forEach((response) => {
                    if (response.status === 'fulfilled' && response.value) {
                        allFeatures.push(...response.value)
                    } else {
                        log.error(
                            'Error while identifying features on external layer, response is',
                            response
                        )
                        // no reject, so that we may see at least the result of requests that have been fulfilled
                    }
                })
                // filtering out duplicates
                resolve(
                    allFeatures.filter((feature, index) => allFeatures.indexOf(feature) === index)
                )
            })
            .catch((error) => {
                log.error('Error while identifying features', error)
                reject(error)
            })
    })
}

/**
 * @typedef FeaturesForLayer
 * @property {String} layerId
 * @property {LayerFeature[]} features
 * @property {Number} featureCountForMoreData If there are more data to load, this will be greater
 *   than 0. If no more data can be requested from the backend, this will be set to 0.
 */

export default {
    state: {
        /** @type {FeaturesForLayer[]} */
        selectedFeaturesByLayerId: [],
        /** @type Array<EditableFeature> */
        selectedEditableFeatures: [],
        highlightedFeatureId: null,
        /**
         * @type {SelectableFeature | null} a Feature for which we will show a height profile, must
         *   have a LineString or Polygon feature
         */
        profileFeature: null,
        /** @type {ElevationProfile | null} Profile Data for the profile geometry */
        profileData: null,
        /** @type {ProfileError | null} */
        profileRequestError: null,
    },
    getters: {
        /** @type Array<SelectableFeature> */
        selectedFeatures(state, getters) {
            return [...state.selectedEditableFeatures, ...getters.selectedLayerFeatures]
        },
        selectedLayerFeatures(state) {
            return state.selectedFeaturesByLayerId
                .map((featuresForLayer) => featuresForLayer.features)
                .flat()
        },
    },
    actions: {
        /**
         * Tells the map to highlight a list of features (place a round marker at their location).
         * Those features are currently shown by the tooltip. If in drawing mode, this functions
         * tells the store which features are selected (it does not select the features by itself)
         *
         * @param commit
         * @param {SelectableFeature[]} features A list of feature we want to highlight/select on
         *   the map
         * @param {Number} paginationSize How many features were requested, will help set if a layer
         *   can have more data or not (if its feature count is a multiple of paginationSize)
         */
        setSelectedFeatures(
            { commit, state },
            { features, paginationSize = DEFAULT_FEATURE_COUNT_SINGLE_POINT, dispatcher }
        ) {
            // clearing up any relevant selected features stuff
            if (state.highlightedFeatureId) {
                commit('setHighlightedFeatureId', {
                    highlightedFeatureId: null,
                    dispatcher,
                })
            }
            if (state.profileFeature) {
                commit('setProfileFeature', { feature: null, dispatcher })
                commit('setProfileData', { data: null, dispatcher })
            }
            /** @type {FeaturesForLayer[]} */
            const layerFeaturesByLayerId = []
            let drawingFeatures = []
            if (Array.isArray(features)) {
                const layerFeatures = features.filter((feature) => feature instanceof LayerFeature)
                drawingFeatures = features.filter((feature) => feature instanceof EditableFeature)
                layerFeatures.forEach((feature) => {
                    if (
                        !layerFeaturesByLayerId.some(
                            (featureForLayer) => featureForLayer.layerId === feature.layer.id
                        )
                    ) {
                        layerFeaturesByLayerId.push({
                            layerId: feature.layer.id,
                            features: [],
                            featureCountForMoreData: paginationSize,
                        })
                    }
                    const featureForLayer = layerFeaturesByLayerId.find(
                        (featureForLayer) => featureForLayer.layerId === feature.layer.id
                    )
                    featureForLayer.features.push(feature)
                })
                layerFeaturesByLayerId.forEach((layerFeatures) => {
                    // if less feature than the pagination size are present, we can already tell there won't be more data to load
                    layerFeatures.featureCountForMoreData =
                        layerFeatures.features.length % paginationSize === 0 ? paginationSize : 0
                })

                // as described by this example on our documentation : https://codepen.io/geoadmin/pen/yOBzqM?editors=0010
                // our app should send a message (see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
                // when a feature is selected while embedded, so that the parent can get the selected feature(s) ID(s)
                sendFeatureInformationToIFrameParent(layerFeatures)
            }
            commit('setSelectedFeatures', {
                drawingFeatures,
                layerFeaturesByLayerId,
                dispatcher,
            })
        },
        /**
         * Identify features in layers at the given coordinate.
         *
         * @param dispatch
         * @param getters
         * @param rootState
         * @param {AbstractLayer[]} layers List of layers for which we want to know if features are
         *   present at given coordinates
         * @param {LayerFeature[]} [vectorFeatures=[]] List of existing vector features at given
         *   coordinate (that should be added to the selected features after identification has been
         *   run on the backend). Default is `[]`
         * @param {[Number, Number] | [Number, Number, Number, Number]} coordinate A point ([x,y]),
         *   or a rectangle described by a flat extent ([minX, maxX, minY, maxY]). 10 features will
         *   be requested for a point, 50 for a rectangle.
         * @param dispatcher
         * @returns {Promise<void>} As some callers might want to know when identify has been
         *   done/finished, this returns a promise that will be resolved when this is the case
         */
        async identifyFeatureAt(
            { dispatch, getters, rootState },
            { layers, coordinate, vectorFeatures = [], dispatcher }
        ) {
            const featureCount = getFeatureCountForCoordinate(coordinate)
            const features = [
                ...vectorFeatures,
                ...(await runIdentify({
                    layers,
                    coordinate,
                    resolution: getters.resolution,
                    mapExtent: flattenExtent(getters.extent),
                    screenWidth: rootState.ui.width,
                    screenHeight: rootState.ui.height,
                    lang: rootState.i18n.lang,
                    projection: rootState.position.projection,
                    featureCount,
                    api3UrlOverride: rootState.debug.baseUrlOverride.api3,
                })),
            ]
            if (features.length > 0) {
                dispatch('setSelectedFeatures', {
                    features,
                    paginationSize: featureCount,
                    dispatcher,
                })
            } else {
                dispatch('clearAllSelectedFeatures', { dispatcher })
            }
        },
        /**
         * Loads (if possible) more features for the given layer.
         *
         * Only GeoAdmin layers support this for the time being. For external layer, as we use
         * GetFeatureInfo from WMS, there's no such capabilities (we would have to switch to a WFS
         * approach to gain access to similar things).
         *
         * @param commit
         * @param state
         * @param getters
         * @param rootState
         * @param {GeoAdminLayer} layer
         * @param {[Number, Number] | [Number, Number, Number, Number]} coordinate A point ([x,y]),
         *   or a rectangle described by a flat extent ([minX, maxX, minY, maxY]).
         * @param dispatcher
         */
        loadMoreFeaturesForLayer(
            { commit, state, getters, rootState },
            { layer, coordinate, dispatcher }
        ) {
            const featuresAlreadyLoaded = state.selectedFeaturesByLayerId.find(
                (featureForLayer) => featureForLayer.layerId === layer?.id
            )
            if (featuresAlreadyLoaded && featuresAlreadyLoaded.featureCountForMoreData > 0) {
                identifyOnGeomAdminLayer({
                    layer,
                    coordinate,
                    resolution: getters.resolution,
                    mapExtent: getters.extent.flat(),
                    screenWidth: rootState.ui.width,
                    screenHeight: rootState.ui.height,
                    lang: rootState.i18n.lang,
                    projection: rootState.position.projection,
                    offset: featuresAlreadyLoaded.features.length,
                    featureCount: featuresAlreadyLoaded.featureCountForMoreData,
                    api3UrlOverride: rootState.debug.baseUrlOverride.api3,
                }).then((moreFeatures) => {
                    const featuresForLayer = state.selectedFeaturesByLayerId.find(
                        (featureForLayer) => featureForLayer.layerId === layer.id
                    )
                    const canLoadMore =
                        moreFeatures.length > 0 &&
                        moreFeatures.length % featuresAlreadyLoaded.featureCountForMoreData === 0
                    commit('addSelectedFeatures', {
                        featuresForLayer,
                        features: moreFeatures,
                        featureCountForMoreData: canLoadMore
                            ? featuresAlreadyLoaded.featureCountForMoreData
                            : 0,
                        dispatcher,
                    })
                })
            } else {
                log.error(
                    'No more features can be loaded for layer',
                    layer,
                    'at coordinate',
                    coordinate
                )
            }
        },
        /** Removes all selected features from the map */
        clearAllSelectedFeatures({ commit, state }, { dispatcher }) {
            commit('setSelectedFeatures', {
                layerFeaturesByLayerId: [],
                drawingFeatures: [],
                dispatcher,
            })
            if (state.highlightedFeatureId) {
                commit('setHighlightedFeatureId', {
                    highlightedFeatureId: null,
                    dispatcher,
                })
            }
            if (state.profileFeature) {
                commit('setProfileFeature', { feature: null, dispatcher })
                commit('setProfileData', { data: null, dispatcher })
            }
        },
        setHighlightedFeatureId({ commit }, { highlightedFeatureId = null, dispatcher }) {
            commit('setHighlightedFeatureId', { highlightedFeatureId, dispatcher })
        },
        /**
         * In drawing mode, informs the store about the new coordinates of the feature. (It does not
         * move the feature.) Only change the coordinates if the feature is editable and part of the
         * currently selected features.
         *
         * Coordinates is an array of coordinate. Marker and text feature have only one entry in
         * this array while line and measure store each points describing them in this coordinates
         * array
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {Number[][]} coordinates
         */
        changeFeatureCoordinates({ commit, state }, { feature, coordinates, geodesicCoordinates }) {
            const selectedFeature = getEditableFeatureWithId(state, feature.id)
            if (selectedFeature && selectedFeature.isEditable && Array.isArray(coordinates)) {
                commit('changeFeatureCoordinates', {
                    feature: selectedFeature,
                    coordinates,
                    geodesicCoordinates,
                })
            }
        },

        changeFeatureGeometry({ commit, dispatch, state }, { feature, geometry, dispatcher }) {
            const selectedFeature = getEditableFeatureWithId(state, feature.id)
            if (selectedFeature && selectedFeature.isEditable && geometry) {
                commit('changeFeatureGeometry', {
                    feature: selectedFeature,
                    geometry,
                    dispatcher,
                })
                // if the feature can show a profile we need to trigger a profile data update
                if (canFeatureShowProfile(selectedFeature)) {
                    dispatch('setProfileFeature', { feature: selectedFeature, dispatcher })
                }
            }
        },
        /**
         * Changes the title of the feature. Only change the title if the feature is editable and
         * part of the currently selected features
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {String} title
         */
        changeFeatureTitle({ commit, state }, { feature, title, dispatcher }) {
            const selectedFeature = getEditableFeatureWithId(state, feature.id)
            if (selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureTitle', { feature: selectedFeature, title, dispatcher })
            }
        },
        /**
         * Changes the description of the feature. Only change the description if the feature is
         * editable and part of the currently selected features
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {String} description
         */
        changeFeatureDescription({ commit, state }, { feature, description, dispatcher }) {
            const selectedFeature = getEditableFeatureWithId(state, feature.id)
            if (selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureDescription', {
                    feature: selectedFeature,
                    description,
                    dispatcher,
                })
            }
        },
        /**
         * Changes the color used to fill the feature. Only change the color if the feature is
         * editable, part of the currently selected features and that the given color is a valid
         * color from {@link FeatureStyleColor}
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {FeatureStyleColor} color
         */
        changeFeatureColor({ commit, state }, { feature, color, dispatcher }) {
            const selectedFeature = getEditableFeatureWithId(state, feature.id)
            const wantedColor = allStylingColors.find(
                (styleColor) => styleColor.name === color.name
            )
            if (wantedColor && selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureColor', {
                    feature: selectedFeature,
                    color: wantedColor,
                    dispatcher,
                })
            }
        },
        /**
         * Changes the text size of the feature. Only change the text size if the feature is
         * editable, part of the currently selected features and that the given size is a valid size
         * from {@link FeatureStyleSize}
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {FeatureStyleSize} textSize
         */
        changeFeatureTextSize({ commit, state }, { feature, textSize, dispatcher }) {
            const selectedFeature = getEditableFeatureWithId(state, feature.id)
            const wantedSize = allStylingSizes.find((size) => size.textScale === textSize.textScale)
            if (wantedSize && selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureTextSize', {
                    feature: selectedFeature,
                    textSize: wantedSize,
                    dispatcher,
                })
            }
        },
        /**
         * Changes the text offset of the feature. Only change the text offset if the feature is
         * editable and part of the currently selected features
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {Array} textOffset
         */
        changeFeatureTextOffset({ commit, state }, { feature, textOffset, dispatcher }) {
            const selectedFeature = getEditableFeatureWithId(state, feature.id)
            if (selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureTextOffset', {
                    feature: selectedFeature,
                    textOffset,
                    dispatcher,
                })
            }
        },
        /**
         * Changes the text color of the feature. Only change the text color if the feature is
         * editable, part of the currently selected features and that the given color is a valid
         * color from {@link FeatureStyleColor}
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {FeatureStyleColor} textColor
         */
        changeFeatureTextColor({ commit, state }, { feature, textColor, dispatcher }) {
            const selectedFeature = getEditableFeatureWithId(state, feature.id)
            const wantedColor = allStylingColors.find(
                (styleColor) => styleColor.name === textColor.name
            )
            if (wantedColor && selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureTextColor', {
                    feature: selectedFeature,
                    textColor: wantedColor,
                    dispatcher,
                })
            }
        },
        /**
         * Changes the icon of the feature. Only change the icon if the feature is editable, part of
         * the currently selected features, is a marker type feature and that the given icon is
         * valid (non-null)
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {Icon} icon
         */
        changeFeatureIcon({ commit, state }, { feature, icon, dispatcher }) {
            const selectedFeature = getEditableFeatureWithId(state, feature.id)
            if (
                icon &&
                selectedFeature &&
                selectedFeature.isEditable &&
                selectedFeature.featureType === EditableFeatureTypes.MARKER
            ) {
                commit('changeFeatureIcon', { feature: selectedFeature, icon, dispatcher })
            }
        },
        /**
         * Changes the icon size of the feature. Only change the icon size if the feature is
         * editable, part of the currently selected features, is a marker type feature and that the
         * given size is a valid size from {@link FeatureStyleSize}
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {FeatureStyleSize} iconSize
         */
        changeFeatureIconSize({ commit, state }, { feature, iconSize, dispatcher }) {
            const selectedFeature = getEditableFeatureWithId(state, feature.id)
            const wantedSize = allStylingSizes.find((size) => size.textScale === iconSize.textScale)
            if (
                wantedSize &&
                selectedFeature &&
                selectedFeature.isEditable &&
                selectedFeature.featureType === EditableFeatureTypes.MARKER
            ) {
                commit('changeFeatureIconSize', {
                    feature: selectedFeature,
                    iconSize: wantedSize,
                    dispatcher,
                })
            }
        },

        /**
         * In drawing mode , tells the state if a given feature is being dragged.
         *
         * @param {EditableFeature} feature
         * @param {Boolean} isDragged
         */
        changeFeatureIsDragged({ commit, state }, { feature, isDragged, dispatcher }) {
            const selectedFeature = getEditableFeatureWithId(state, feature.id)
            if (selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureIsDragged', {
                    feature: selectedFeature,
                    isDragged: !!isDragged,
                    dispatcher,
                })
            }
        },
        /**
         * Sets the GeoJSON geometry for which we want a profile and request this profile from the
         * backend (if the geometry is a valid one)
         *
         * Only GeoJSON LineString and Polygon types are supported to request a profile.
         *
         * @param {Vuex.Store} store
         * @param {SelectableFeature | null} feature A feature which has a LineString or Polygon
         *   geometry, and for which we want to show a height profile (or `null` if the profile
         *   should be cleared/hidden)
         * @param dispatcher
         */
        setProfileFeature(store, { feature = null, dispatcher }) {
            const { state, commit, rootState } = store
            if (feature === null) {
                commit('setProfileFeature', { feature: null, dispatcher })
                commit('setProfileData', { data: null, dispatcher })
            } else if (canFeatureShowProfile(feature)) {
                if (state.profileRequestError) {
                    commit('setProfileRequestError', { error: null, dispatcher })
                }
                commit('setProfileFeature', { feature: feature, dispatcher })
                commit('setProfileData', { data: null, dispatcher })
                if (feature?.geometry) {
                    let coordinates = [...feature.geometry.coordinates]
                    // unwrapping the first set of coordinates if they come from a multi-feature type geometry
                    if (coordinates[0].some((coordinage) => Array.isArray(coordinage))) {
                        coordinates = coordinates[0]
                    }
                    getProfile(coordinates, rootState.position.projection)
                        .then((profileData) => {
                            commit('setProfileData', { data: profileData, dispatcher })
                        })
                        .catch((error) => {
                            log.error('Error while request profile data for', feature, error)
                            commit('setProfileRequestError', { error: error, dispatcher })
                        })
                }
            } else {
                log.warn('Geometry type not supported to show a profile, ignoring', feature)
            }
        },
        /**
         * The goal of this function is to refresh the selected features according to changes that
         * happened in the store, but outside feature selection. For example, when we change the
         * language, we need to update the selected features otherwise we keep them in the old
         * language until new features are selected.
         *
         * @param {Store} store The vue store
         * @param {Object} dispatcher The dispatcher
         */
        async updateFeatures(store, { dispatcher }) {
            const { state, commit, getters, rootState } = store
            const featuresPromises = []
            getters.selectedLayerFeatures.forEach((feature) => {
                // we avoid requesting the drawings and external layers, they're not handled here
                if (rootState.layers.config.find((layer) => layer.id === feature.layer.id)) {
                    featuresPromises.push(
                        getFeature(feature.layer, feature.id, rootState.position.projection, {
                            lang: rootState.i18n.lang,
                            screenWidth: rootState.ui.width,
                            screenHeight: rootState.ui.height,
                            mapExtent: flattenExtent(rootState.getters.mapExtent),
                            coordinate: rootState.map.clickInfo?.coordinate,
                        })
                    )
                }
            })
            if (featuresPromises.length > 0) {
                try {
                    const responses = await Promise.allSettled(featuresPromises)
                    const features = responses
                        .filter((response) => response.status === 'fulfilled')
                        .map((response) => response.value)
                    if (features.length > 0) {
                        const updatedFeaturesByLayerId = state.selectedFeaturesByLayerId.reduce(
                            (updated_array, layer) => {
                                const rawLayer = toRaw(layer)
                                const rawLayerFeatures = rawLayer.features
                                rawLayer.features = features.reduce((features_array, feature) => {
                                    if (feature.layer.id === rawLayer.layerId) {
                                        features_array.push(feature)
                                    }
                                    return features_array
                                }, [])
                                if (rawLayer.features.length === 0) {
                                    rawLayer.features = rawLayerFeatures
                                }
                                updated_array.push(rawLayer)
                                return updated_array
                            },
                            []
                        )
                        await commit('setSelectedFeatures', {
                            layerFeaturesByLayerId: updatedFeaturesByLayerId,
                            drawingFeatures: state.selectedEditableFeatures,
                            ...dispatcher,
                        })
                    }
                } catch (error) {
                    log.error(
                        `Error while attempting to update already selected features. error is ${error}`
                    )
                }
            }
        },
    },
    mutations: {
        setSelectedFeatures(state, { layerFeaturesByLayerId, drawingFeatures }) {
            state.selectedFeaturesByLayerId = layerFeaturesByLayerId
            state.selectedEditableFeatures = [...drawingFeatures]
        },
        addSelectedFeatures(state, { featuresForLayer, features, featureCountForMoreData = 0 }) {
            featuresForLayer.features.push(...features)
            featuresForLayer.featureCountForMoreData = featureCountForMoreData
        },
        setHighlightedFeatureId(state, { highlightedFeatureId }) {
            state.highlightedFeatureId = highlightedFeatureId
        },
        changeFeatureCoordinates(state, { feature, coordinates, geodesicCoordinates }) {
            feature.coordinates = coordinates
            feature.geodesicCoordinates = geodesicCoordinates
        },
        changeFeatureGeometry(state, { feature, geometry }) {
            feature.geometry = geometry
        },
        changeFeatureTitle(state, { feature, title }) {
            feature.title = title
        },
        changeFeatureDescription(state, { feature, description }) {
            feature.description = description
        },
        changeFeatureColor(state, { feature, color }) {
            feature.fillColor = color
        },
        changeFeatureTextSize(state, { feature, textSize }) {
            feature.textSize = textSize
        },
        changeFeatureTextOffset(state, { feature, textOffset }) {
            feature.textOffset = textOffset
        },
        changeFeatureTextColor(state, { feature, textColor }) {
            feature.textColor = textColor
        },
        changeFeatureIcon(state, { feature, icon }) {
            feature.icon = icon
        },
        changeFeatureIconSize(state, { feature, iconSize }) {
            feature.iconSize = iconSize
        },
        changeFeatureIsDragged(state, { feature, isDragged }) {
            feature.isDragged = isDragged
        },
        setProfileFeature(state, { feature }) {
            state.profileFeature = feature
        },
        setProfileData(state, { data }) {
            state.profileData = data
        },
        setProfileRequestError(state, { error }) {
            state.profileRequestError = error
        },
    },
}
