import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
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
    },
    getters: {
        isDrawingEmpty(state) {
            return state.featureIds.length === 0
        },
    },
    actions: {
        setDrawingMode({ commit }, { mode, dispatcher }) {
            if (mode in EditableFeatureTypes || mode === null) {
                commit('setDrawingMode', { mode, dispatcher })
            }
        },
        async loadAvailableIconSets({ commit }, { dispatcher }) {
            const iconSets = await loadAllIconSetsFromBackend()
            if (iconSets?.length > 0) {
                commit('setIconSets', { iconSets, dispatcher })
            }
        },
        addDrawingFeature({ commit }, { featureId, dispatcher }) {
            commit('addDrawingFeature', { featureId, dispatcher })
        },
        deleteDrawingFeature({ commit, dispatch }, { featureId, dispatcher }) {
            dispatch('clearAllSelectedFeatures', { dispatcher: dispatcher })
            commit('deleteDrawingFeature', { featureId })
        },
        clearDrawingFeatures({ commit }, { dispatcher }) {
            commit('setDrawingFeatures', { featureIds: [], dispatcher })
        },
        setDrawingFeatures({ commit }, { featureIds, dispatcher }) {
            commit('setDrawingFeatures', { featureIds, dispatcher })
        },
    },
    mutations: {
        setDrawingMode: (state, { mode }) => (state.mode = mode),
        setIconSets: (state, { iconSets }) => (state.iconSets = iconSets),
        addDrawingFeature: (state, { featureId }) => state.featureIds.push(featureId),
        deleteDrawingFeature: (state, { featureId }) =>
            (state.featureIds = state.featureIds.filter((featId) => featId !== featureId)),
        setDrawingFeatures: (state, { featureIds }) => (state.featureIds = featureIds),
    },
}
