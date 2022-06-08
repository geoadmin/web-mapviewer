import { EditableFeatureTypes } from '@/api/features.api'
import { getKmlUrl } from '@/api/files.api'
import { loadAllIconSetsFromBackend } from '@/api/icon.api'

/**
 * Enumerate of all possible drawing modes for the viewer :
 *
 * - Marker
 * - Annotation (text)
 * - LinePolygon
 * - Measure (profile)
 *
 * @enum
 */
export const DrawingModes = {
    ...EditableFeatureTypes,
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
         * Current drawing mode (or `null` if there is none). See {@link DrawingModes}
         *
         * @type {String | null}
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
        /**
         * List of feature IDs being currently drawn
         *
         * @type {String[]}
         */
        featureIds: [],
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
            if (mode in DrawingModes || mode === null) {
                commit('setDrawingMode', mode)
            }
        },
        setKmlIds({ commit }, drawingKmlIds) {
            commit('setKmlIds', drawingKmlIds)
        },
        async loadAvailableIconSets({ commit }) {
            const iconSets = await loadAllIconSetsFromBackend()
            if (iconSets?.length > 0) {
                commit('setIconSets', iconSets)
            }
        },
        addDrawingFeature({ commit }, featureId) {
            commit('addDrawingFeature', featureId)
        },
        deleteDrawingFeature({ commit, dispatch }, featureId) {
            dispatch('clearAllSelectedFeatures')
            commit('deleteDrawingFeature', featureId)
        },
    },
    mutations: {
        setDrawingMode: (state, mode) => (state.mode = mode),
        setKmlIds: (state, drawingKmlIds) => (state.drawingKmlIds = drawingKmlIds),
        setIconSets: (state, iconSets) => (state.iconSets = iconSets),
        addDrawingFeature: (state, featureId) => state.featureIds.push(featureId),
        deleteDrawingFeature: (state, featureId) =>
            (state.featureIds = state.featureIds.filter((featId) => featId !== featureId)),
    },
}
