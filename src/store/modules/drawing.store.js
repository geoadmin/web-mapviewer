import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { loadAllIconSetsFromBackend } from '@/api/icon.api'

const defaultDrawingTitle = 'draw_mode_title'

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
         * Drawing overlay configuration
         *
         * @type {{ show: boolean; title: string }}
         */
        drawingOverlay: {
            /**
             * Flag to toggle drawing mode overlay
             *
             * @type {Boolean}
             */
            show: false,
            /**
             * Title translation key of the drawing overlay
             *
             * @type {String}
             */
            title: defaultDrawingTitle,
        },
        /**
         * KML is saved online using the KML backend service
         *
         * @type {Boolean}
         */
        online: true,
        /**
         * KML ID to use for temporary local KML (only used when online === false)
         *
         * @type {String | null}
         */
        temporaryKmlId: null,
        /**
         * The name of the drawing, or null if no drawing is currently edited.
         *
         * @type {String | null}
         */
        name: null,
        /**
         * If true, continue the line string from the starting vertex, else it will continue from
         * the last vertex
         *
         * @type {Boolean | null}
         */
        reverseLineStringExtension: false,

        extendingLineString: false,
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
        toggleDrawingOverlay(
            { commit, state },
            { online = true, kmlId = null, title = defaultDrawingTitle, dispatcher }
        ) {
            commit('setShowDrawingOverlay', {
                show: !state.drawingOverlay.show,
                online,
                kmlId,
                title,
                dispatcher,
            })
        },
        setShowDrawingOverlay(
            { commit },
            { show, online = true, kmlId = null, title = defaultDrawingTitle, dispatcher }
        ) {
            commit('setShowDrawingOverlay', {
                show,
                online,
                kmlId,
                title,
                dispatcher,
            })
        },
        setDrawingName({ commit }, { name, dispatcher }) {
            commit('setDrawingName', { name, dispatcher })
        },
        setReverseLineStringExtension({ commit }, { reverseLineStringExtension, dispatcher }) {
            commit('setReverseLineStringExtension', { reverseLineStringExtension, dispatcher })
        },
        setExtendingLineString({ commit }, { extendingLineString, dispatcher }) {
            commit('setExtendingLineString', { extendingLineString, dispatcher })
        },
    },
    mutations: {
        setDrawingMode: (state, { mode }) => (state.mode = mode),
        setIconSets: (state, { iconSets }) => (state.iconSets = iconSets),
        addDrawingFeature: (state, { featureId }) => state.featureIds.push(featureId),
        deleteDrawingFeature: (state, { featureId }) =>
            (state.featureIds = state.featureIds.filter((featId) => featId !== featureId)),
        setDrawingFeatures: (state, { featureIds }) => (state.featureIds = featureIds),
        setShowDrawingOverlay(state, { show, online, kmlId, title }) {
            state.drawingOverlay.show = show
            state.drawingOverlay.title = title
            state.online = online
            state.temporaryKmlId = kmlId
        },
        setDrawingName(state, { name }) {
            state.name = name
        },
        setReverseLineStringExtension(state, { reverseLineStringExtension }) {
            state.reverseLineStringExtension = reverseLineStringExtension
        },
        setExtendingLineString(state, { extendingLineString }) {
            state.extendingLineString = extendingLineString
        },
    },
}
