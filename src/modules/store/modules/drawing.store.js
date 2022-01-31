import axios from 'axios'
import { IS_TESTING_WITH_CYPRESS } from '@/config'
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
        getDrawingPublicFileUrl: (state) => {
            if (state.drawingKmlIds) {
                return getKmlUrl(state.drawingKmlIds.fileId)
            }
            return null
        },
        isCurrentlyDrawing: (state) => {
            return state.mode !== null
        },
    },
    actions: {
        setDrawingMode: ({ commit }, mode) => {
            if (mode in drawingModes || mode === null) {
                commit('setDrawingMode', mode)
            }
        },
        setKmlIds: ({ commit }, drawingKmlIds) => {
            commit('setKmlIds', drawingKmlIds)
        },
        loadAvailableIconSets: ({ commit }) => {
            getAllIconSets().then((iconSets) => {
                if (iconSets && iconSets.length > 0) {
                    commit('setIconSets', iconSets)
                }
                // We have a race condition during testing where the icons are
                // needed after being loaded from the backend but before being
                // committed to the store. Intercept and wait are in goToDrawing.
                if (IS_TESTING_WITH_CYPRESS) {
                    axios.get('/tell-cypress-icon-sets-available')
                }
            })
        },
    },
    mutations: {
        setDrawingMode: (state, mode) => (state.mode = mode),
        setKmlIds: (state, drawingKmlIds) => (state.drawingKmlIds = drawingKmlIds),
        setIconSets: (state, iconSets) => (state.iconSets = iconSets),
    },
}
