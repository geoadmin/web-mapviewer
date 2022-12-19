import { EditableFeatureTypes } from '@/api/features.api'
import { loadAllIconSetsFromBackend } from '@/api/icon.api'

/**
 * @typedef SelectedFeatureData
 * @property {[number, number]} coordinate
 * @property {string} featureId
 */

export default {
    state: {
        /**
         * Current drawing mode (or `null` if there is none). See {@link EditableFeatureTypes}
         *
         * @type {String | null}
         */
        mode: null,
        /**
         * List of all available icon sets for drawing (loaded from the backend service-icons)
         *
         * @type {IconSet[]}
         */
        iconSets: [],
        /**
         * Feature IDs of all features that have been drawn.
         *
         * Removing an ID from the list will trigger a watcher that will delete the respective
         * feature.
         *
         * @type {String[]}
         */
        featureIds: [],
        /**
         * Current active KML layer
         *
         * @type {KMLLayer | null}
         */
        activeKmlLayer: null,
    },
    getters: {
        isCurrentlyDrawing(state) {
            return state.mode !== null
        },
    },
    actions: {
        setDrawingMode({ commit }, mode) {
            if (mode in EditableFeatureTypes || mode === null) {
                commit('setDrawingMode', mode)
            }
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
        clearDrawingFeatures({ commit }) {
            commit('setDrawingFeatures', [])
        },
        setDrawingFeatures({ commit }, featureIds) {
            commit('setDrawingFeatures', featureIds)
        },
        setActiveKmlLayer({ commit }, activeKmlLayer) {
            commit('setActiveKmlLayer', activeKmlLayer)
        },
    },
    mutations: {
        setDrawingMode: (state, mode) => (state.mode = mode),
        setIconSets: (state, iconSets) => (state.iconSets = iconSets),
        addDrawingFeature: (state, featureId) => state.featureIds.push(featureId),
        deleteDrawingFeature: (state, featureId) =>
            (state.featureIds = state.featureIds.filter((featId) => featId !== featureId)),
        setDrawingFeatures: (state, featureIds) => (state.featureIds = featureIds),
        setActiveKmlLayer: (state, activeKmlLayer) => (state.activeKmlLayer = activeKmlLayer),
    },
}
