import GeoAdmin3DLayer from '@/api/layers/GeoAdmin3DLayer.class'
import {
    CESIUM_BUILDING_LAYER_ID,
    CESIUM_CONSTRUCTIONS_LAYER_ID,
    CESIUM_LABELS_LAYER_ID,
    CESIUM_LAYER_TOOLTIPS_CONFIGURATION,
    CESIUM_VEGETATION_LAYER_ID,
} from '@/config/cesium.config'

const labelLayer = new GeoAdmin3DLayer({
    layerId: CESIUM_LABELS_LAYER_ID,
    layerName: '3d_labels',
    urlTimestampToUse: '20180716',
    use3dTileSubFolder: true,
})
const vegetationLayer = new GeoAdmin3DLayer({
    layerId: CESIUM_VEGETATION_LAYER_ID,
    layerName: '3d_vegetation',
    urlTimestampToUse: 'v1',
    use3dTileSubFolder: false,
})
const buildingsLayer = new GeoAdmin3DLayer({
    layerId: CESIUM_BUILDING_LAYER_ID,
    layerName: '3d_constructions',
    urlTimestampToUse: 'v1',
    use3dTileSubFolder: false, // buildings JSON has already been migrated to the new URL nomenclature
})
const constructionsLayer = new GeoAdmin3DLayer({
    layerId: CESIUM_CONSTRUCTIONS_LAYER_ID,
    layerName: '3d_constructions',
    urlTimestampToUse: 'v1',
    use3dTileSubFolder: false, // buildings JSON has already been migrated to the new URL nomenclature
})

// TODO :
// move this to cesium config
// create "local" locales translations json with layer prefixes for the keys
// generalize generation

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
        /**
         * Flag telling if the 3D viewer is ready or not
         *
         * @type Boolean
         */
        isViewerReady: false,
        /**
         * An object containing the fetchable parameters for each cesium layer
         *
         * It will be used in the following manner : id is what property of the feature is used for
         * the id of a feature in the layer. data represents the keys for each data (which will be
         * translated), and which data property will be associated to it (this will never be
         * translated)
         *
         * @type Object
         */
        featuresParamsByCesiumLayerId: CESIUM_LAYER_TOOLTIPS_CONFIGURATION,
    },
    getters: {
        backgroundLayersFor3D(state, getters, rootState) {
            const bgLayers = []
            const backgroundLayer = getters.currentBackgroundLayer
            if (backgroundLayer) {
                if (backgroundLayer.idIn3d) {
                    bgLayers.push(
                        rootState.layers.config.find((layer) => layer.id === backgroundLayer.idIn3d)
                    )
                } else {
                    bgLayers.push(backgroundLayer)
                }
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
        layersWithTooltips(state, getters) {
            return getters.backgroundLayersFor3D.filter((layer) =>
                Object.keys(getters.featuresParamsByCesiumLayerId).includes(layer.id)
            )
        },
        featuresParamsByCesiumLayerId(state) {
            return state.featuresParamsByCesiumLayerId
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
        setViewerReady({ commit }, { isViewerReady, dispatcher }) {
            commit('setViewerReady', { isViewerReady, dispatcher })
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
        setViewerReady: (state, { isViewerReady }) => (state.isViewerReady = isViewerReady),
    },
}
