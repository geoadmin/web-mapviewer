import GeoAdmin3DLayer from '@/api/layers/GeoAdmin3DLayer.class'

const labelLayer = new GeoAdmin3DLayer('ch.swisstopo.swissnames3d.3d', '20180716', true)
const vegetationLayer = new GeoAdmin3DLayer('ch.swisstopo.vegetation.3d', 'v1', false)
const buildingsLayer = new GeoAdmin3DLayer(
    'ch.swisstopo.swissbuildings3d.3d',
    'v1',
    false // buildings JSON has already been migrated to the new URL nomenclature
)
const constructionsLayer = new GeoAdmin3DLayer(
    'ch.swisstopo.swisstlm3d.3d',
    'v1',
    false // buildings JSON has already been migrated to the new URL nomenclature
)

/** Module that stores all information related to the 3D viewer */
export default {
    state: {
        /**
         * Flag telling if the app should be displaying the map in 3D or not
         *
         * @type Boolean
         */
        active: false,
        /**
         * Flag telling if the 3D viewer should show the vegetation layer
         * (ch.swisstopo.vegetation.3d)
         *
         * The vegetation layer needs to be updated to work optimally with the latest version of
         * Cesium. While waiting for this update to be available, we disable the vegetation layer by
         * default (it can be activated through the debug tools on the side of the map)
         *
         * @type Boolean
         */
        showVegetation: true,
        /**
         * Flag telling if the 3D viewer should show buildings (ch.swisstopo.swisstlbuildings3d.3d).
         * As this layer has already been updated for the latest Cesium stack, we activate it by
         * default.
         *
         * @type Boolean
         */
        showBuildings: true,
        /**
         * Flag telling if the 3D viewer should show buildings (ch.swisstopo.swisstlm3d.3d). As this
         * layer has already been updated for the latest Cesium stack, we activate it by default.
         *
         * @type Boolean
         */
        showConstructions: true,
        /**
         * Flag telling if the 3D viewer should show the labels ()
         *
         * @type Boolean
         */
        showLabels: true,
    },
    getters: {
        backgroundLayersFor3D(state, _, rootState) {
            const bgLayers = []
            const backgroundLayer = rootState.layers.currentBackgroundLayer
            if (backgroundLayer) {
                bgLayers.push(backgroundLayer)
            }
            if (state.showLabels) {
                // labels are not up-to-date with the latest Cesium version, but we need then anyway ¯\_(ツ)_/¯
                bgLayers.push(labelLayer)
            }
            if (state.showBuildings) {
                bgLayers.push(buildingsLayer)
            }
            if (state.showConstructions) {
                bgLayers.push(constructionsLayer)
            }
            if (state.showVegetation) {
                bgLayers.push(vegetationLayer)
            }
            return bgLayers
        },
    },
    actions: {
        set3dActive({ commit }, { active, dispatcher }) {
            commit('set3dActive', { active: !!active, dispatcher })
        },
        toggleShow3dBuildings({ commit, state }, { dispatcher }) {
            commit('setShowBuildings', { showBuildings: !state.showBuildings, dispatcher })
        },
        toggleShow3dConstructions({ commit, state }, { dispatcher }) {
            commit('setShowConstructions', {
                showConstructions: !state.showConstructions,
                dispatcher,
            })
        },
        toggleShow3dConstructionsBuildings({ commit, state }, { dispatcher }) {
            commit('setShowConstructionsBuildings', {
                showConstructionsBuildings: !(state.showConstructions || state.showBuildings),
                dispatcher,
            })
        },
        toggleShow3dVegetation({ commit, state }, { dispatcher }) {
            commit('setShowVegetation', { showVegetation: !state.showVegetation, dispatcher })
        },
        setShowConstructionsBuildings({ commit }, { showConstructionsBuildings, dispatcher }) {
            commit('setShowConstructionsBuildings', {
                showConstructionsBuildings,
                dispatcher,
            })
        },
        setShowVegetation({ commit }, { showVegetation, dispatcher }) {
            commit('setShowVegetation', { showVegetation, dispatcher })
        },
        setShowLabels({ commit }, { showLabels, dispatcher }) {
            commit('setShowLabels', { showLabels, dispatcher })
        },
    },
    mutations: {
        set3dActive: (state, { active }) => (state.active = active),
        setShowBuildings: (state, { showBuildings }) => (state.showBuildings = showBuildings),
        setShowConstructions: (state, { showConstructions }) =>
            (state.showConstructions = showConstructions),
        setShowVegetation: (state, { showVegetation }) => (state.showVegetation = showVegetation),
        setShowConstructionsBuildings: (state, { showConstructionsBuildings }) => {
            state.showBuildings = showConstructionsBuildings
            state.showConstructions = showConstructionsBuildings
        },
        setShowLabels: (state, { showLabels }) => (state.showLabels = showLabels),
    },
}
