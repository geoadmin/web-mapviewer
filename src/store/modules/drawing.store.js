import { getAllIconSets } from '@/api/icon.api'
import { getKmlUrl } from '@/api/files.api'

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
         * Ids of stored KML file
         *
         * @type {DrawingKmlIds | null}
         */
        drawingKmlIds: null,
        /**
         * List of all available icon sets for drawing (loaded from the backend service-icons)
         *
         * @type {IconSet[]}
         */
        iconSets: [],
    },
    getters: {
        getDrawingPublicFileUrl(state) {
            if (state.drawingKmlIds) {
                return getKmlUrl(state.drawingKmlIds.fileId)
            }
            return null
        },
        isCurrentlyDrawing(state) {
            return state.mode !== null
        },
    },
    actions: {
        setDrawingMode({ commit }, mode) {
            if (mode in drawingModes || mode === null) {
                commit('setDrawingMode', mode)
            }
        },
        setKmlIds({ commit }, drawingKmlIds) {
            commit('setKmlIds', drawingKmlIds)
        },
        async loadAvailableIconSets({ commit }) {
            const iconSets = await getAllIconSets()
            if (iconSets?.length > 0) {
                commit('setIconSets', iconSets)
            }
        },
    },
    mutations: {
        setDrawingMode: (state, mode) => (state.mode = mode),
        setKmlIds: (state, drawingKmlIds) => (state.drawingKmlIds = drawingKmlIds),
        setIconSets: (state, iconSets) => (state.iconSets = iconSets),
    },
}
