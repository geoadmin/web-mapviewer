/** @enum */
export const drawingModes = {
    MARKER: 'MARKER',
    TEXT: 'TEXT',
    LINE: 'LINE',
    MEASURE: 'MEASURE',
}

/**
 * @typedef SelectedFeatureData
 * @property {[number, number]} coordinate
 * @property {string} featureId
 */

/**
 * @typedef DrawingKmlIds
 * @property {string} adminId
 * @property {string} fileId
 */

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
         * @type {import('ol/format/GeoJSON').GeoJSONFeatureCollection | null}
         */
        geoJson: null,
        /**
         * Current drawing as a GeoJSON, or null if there's no drawing
         *
         * @type {SelectedFeatureData | null}
         */
        selectedFeatureData: null,
        /**
         * Ids of stored KML file
         *
         * @type {DrawingKmlIds | null}
         */
        drawingKmlIds: null,
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
        setDrawingSelectedFeatureData: ({ commit }, feature) => {
            commit('setDrawingSelectedFeatureData', feature)
        },
        setKmlIds: ({ commit }, drawingKmlIds) => {
            commit('setKmlIds', drawingKmlIds)
        },
    },
    mutations: {
        setDrawingMode: (state, mode) => (state.mode = mode),
        setDrawingGeoJSON: (state, geoJson) => (state.geoJson = geoJson),
        setDrawingSelectedFeatureData: (state, feature) => (state.selectedFeatureData = feature),
        setKmlIds: (state, drawingKmlIds) => (state.drawingKmlIds = drawingKmlIds),
    },
}
