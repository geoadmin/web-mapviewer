import tokml from 'tokml'
import { create, update } from '@/api/files.api'
import GeoJSON from 'ol/format/GeoJSON'

/** @enum */
export const drawingModes = {
    MARKER: 'MARKER',
    TEXT: 'TEXT',
    LINE: 'LINE',
    MEASURE: 'MEASURE',
}
const olGeoJson = new GeoJSON()

export default {
    state: {
        /**
         * Current drawing mode (or `null` if there is none)
         *
         * @type {drawingModes | null}
         */
        mode: null,
        /**
         * Current drawing as a GeoJSON, or null if there's no drawing
         *
         * @type {Object | null}
         */
        geoJson: null,
        /**
         * Array of drawn features
         *
         * @type {Array}
         */
        features: [],
    },
    getters: {
        getFeatures(state) {
            return state.features
        },
    },
    actions: {
        setDrawingMode: ({ commit }, mode) => {
            if (mode in drawingModes || mode === null) {
                commit('setDrawingMode', mode)
            }
        },
        setDrawingGeoJSON: ({ commit }, geoJson) => {
            // TODO: validate GeoJSON (maybe with Mapbox utils, but some part/dependencies are deprecated)
            commit('setDrawingGeoJSON', geoJson)
        },
        addFeature: async ({ commit }, feature) => {
            const geojson = olGeoJson.writeFeatureObject(feature)
            const kml = tokml(geojson)
            const response = await create(kml)
            feature.set('id', response.adminId)
            commit('addFeature', {
                adminId: response.adminId,
                fileId: response.fileId,
            })
        },
        // todo probably remove it
        modifyFeature: async ({ commit, getters }, feature) => {
            const id = feature.get('id')
            const geojson = olGeoJson.writeFeatureObject(feature)
            const kml = tokml(geojson)
            const response = await update(id, kml)
            feature.set('id', response.adminId)
            const features = getters.getFeatures
            const featureIndex = features.findIndex((f) => f.adminId === id)
            features[featureIndex].adminId = response.adminId
            features[featureIndex].fileId = response.fileId
            commit('setFeatures', features)
        },
    },
    mutations: {
        setDrawingMode: (state, mode) => (state.mode = mode),
        setDrawingGeoJSON: (state, geoJson) => (state.geoJson = geoJson),
        addFeature: (state, feature) => state.features.push(feature),
        setFeatures: (state, features) => (state.features = features),
    },
}
