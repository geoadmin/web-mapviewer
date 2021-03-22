/** @enum */
export const drawingModes = {
    MARKER: 'MARKER',
    TEXT: 'TEXT',
    LINE: 'LINE',
    MEASURE: 'MEASURE',
}

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
    },
    getters: {},
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
    },
    mutations: {
        setDrawingMode: (state, mode) => (state.mode = mode),
        setDrawingGeoJSON: (state, geoJson) => (state.geoJson = geoJson),
    },
}
