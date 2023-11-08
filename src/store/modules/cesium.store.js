import GeoAdmin3DLayer from '@/api/layers/GeoAdmin3DLayer.class'

const labelLayer = new GeoAdmin3DLayer('ch.swisstopo.swissnames3d.3d', '20180716', true)
const vegetationLayer = new GeoAdmin3DLayer('ch.swisstopo.vegetation.3d', '20190313', true)
const buildingsLayer = new GeoAdmin3DLayer(
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
        showVegetation: false,
        /**
         * Flag telling if the 3D viewer should show buildings (ch.swisstopo.swisstlm3d.3d). As this
         * layer has already been updated for the latest Cesium stack, we activate it by default.
         *
         * @type Boolean
         */
        showBuildings: true,
    },
    getters: {
        backgroundLayersFor3D(state, _, rootState) {
            const bgLayers = []
            const backgroundLayer = rootState.layers.currentBackgroundLayer
            if (backgroundLayer) {
                bgLayers.push(backgroundLayer)
            }
            // labels are not up-to-date with the latest Cesium version, but we need then anyway ¯\_(ツ)_/¯
            bgLayers.push(labelLayer)
            if (state.showBuildings) {
                bgLayers.push(buildingsLayer)
            }
            if (state.showVegetation) {
                bgLayers.push(vegetationLayer)
            }
            return bgLayers
        },
    },
    actions: {
        set3dActive({ commit }, is3dActive) {
            commit('set3dActive', !!is3dActive)
        },
        toggleShow3dBuildings({ commit, state }) {
            commit('setShowBuildings', !state.showBuildings)
        },
        toggleShow3dVegetation({ commit, state }) {
            commit('setShowVegetation', !state.showVegetation)
        },
    },
    mutations: {
        set3dActive: (state, flagValue) => (state.active = flagValue),
        setShowBuildings: (state, flagValue) => (state.showBuildings = flagValue),
        setShowVegetation: (state, flagValue) => (state.showVegetation = flagValue),
    },
}
