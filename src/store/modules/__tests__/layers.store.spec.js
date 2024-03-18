import { expect } from 'chai'
import { beforeEach, describe, it } from 'vitest'

import AbstractLayer, { LayerAttribution } from '@/api/layers/AbstractLayer.class'
// import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
// import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
// We need to import the router here to avoid error when initializing router plugins, this is
// needed since some store plugins might require access to router to get the query parameters
// (e.g. topic management plugin)
import router from '@/router' // eslint-disable-line no-unused-vars
import store from '@/store'

const bgLayer = new GeoAdminWMTSLayer({
    name: 'background',
    geoAdminId: 'bg.layer',
    technicalName: 'bg.layer',
    visible: true,
    format: 'jpeg',
    isBackground: true,
    attributions: [new LayerAttribution('test')],
})
const firstLayer = new GeoAdminWMTSLayer({
    name: 'First layer',
    geoAdminId: 'first.layer',
    technicalName: 'first.layer',
    visible: true,
    attributions: [new LayerAttribution('test')],
})
const secondLayer = new GeoAdminWMSLayer({
    name: 'Second layer',
    geoAdminId: 'second.layer',
    technicalName: 'second.layer',
    visible: true,
    timeConfig: new LayerTimeConfig(),
    attributions: [new LayerAttribution('test')],
})

const resetStore = async () => {
    await store.dispatch('clearLayers', { dispatcher: 'unit-test' })
    await store.dispatch('setBackground', { bgLayer: null, dispatcher: 'unit-test' })
    await store.dispatch('setLayerConfig', { config: [], dispatcher: 'unit-test' })
}

describe('Background layer is correctly set', () => {
    const getBackgroundLayer = () => store.state.layers.currentBackgroundLayer

    beforeEach(async () => {
        await resetStore()
    })

    it('does not have a background selected by default', () => {
        expect(getBackgroundLayer()).to.be.null
    })
    it('does not select a background if the one given is not present in the config', async () => {
        await store.dispatch('setBackground', { bgLayer: bgLayer.id, dispatcher: 'unit-test' })
        expect(getBackgroundLayer()).to.be.null
    })
    it('does select the background if it is present in the config', async () => {
        await store.dispatch('setLayerConfig', { config: [bgLayer], dispatcher: 'unit-test' })
        await store.dispatch('setBackground', { bgLayer: bgLayer.id, dispatcher: 'unit-test' })
        expect(getBackgroundLayer()).to.be.an.instanceof(AbstractLayer)
        expect(getBackgroundLayer().id).to.eq(bgLayer.id)
    })
    it('does not permit to select a background that has not the flag isBackground set to true', async () => {
        await store.dispatch('setLayerConfig', { config: [firstLayer], dispatcher: 'unit-test' })
        await store.dispatch('setBackground', {
            bgLayer: firstLayer.id,
            dispatcher: 'unit-test',
        })
        expect(getBackgroundLayer()).to.be.null
    })
})

describe('Add layer creates copy of layers config (so that we may add multiple time the same layer)', () => {
    const checkRefNotEqButDeepEq = (expected, result) => {
        expect(result).to.not.be.eq(expected)
        expect(result).to.deep.eq(expected)
    }

    beforeEach(async () => {
        await resetStore()
        await store.dispatch('setLayerConfig', {
            config: [bgLayer, firstLayer, secondLayer],
            dispatcher: 'unit-test',
        })
    })
    it('creates a copy of the layers config when adding a layer through its ID', async () => {
        store.dispatch('addLayer', { layerId: firstLayer.id, dispatcher: 'unit-test' })
        const layers = store.getters.getActiveLayersById(firstLayer.id)
        expect(layers).to.have.lengthOf(1)
        checkRefNotEqButDeepEq(firstLayer, layers[0])
    })
    it('creates a copy of the layers config when adding with the config directly', async () => {
        store.dispatch('addLayer', { layer: firstLayer, dispatcher: 'unit-test' })
        const layers = store.getters.getActiveLayersById(firstLayer.id)
        expect(layers).to.have.lengthOf(1)
        checkRefNotEqButDeepEq(firstLayer, layers[0])
        // now the same test, but by grabbing the first layer's config directly from the store's config
        checkRefNotEqButDeepEq(
            store.state.layers.config.find((layer) => layer.id === firstLayer.id),
            layers[0]
        )
    })
    it('does not force the visibility of the layer to true when adding it', async () => {
        const invisibleLayer = firstLayer.clone()
        invisibleLayer.visible = false
        await store.dispatch('setLayerConfig', {
            config: [bgLayer, invisibleLayer, secondLayer],
            dispatcher: 'unit-test',
        })
        store.dispatch('addLayer', { layer: invisibleLayer, dispatcher: 'unit-test' })
        const addedLayers = store.getters.getActiveLayersById(invisibleLayer.id)
        expect(addedLayers).to.have.lengthOf(1)
        expect(addedLayers[0]).to.be.an.instanceof(AbstractLayer)
        expect(addedLayers[0].visible).to.be.false
    })
})

describe('Visible layers are filtered correctly by the store', () => {
    const getVisibleLayers = () => store.getters.visibleLayers

    beforeEach(async () => {
        await resetStore()
        await store.dispatch('setLayerConfig', {
            config: [bgLayer, firstLayer, secondLayer],
            dispatcher: 'unit-test',
        })
    })

    it('gives an empty array if no layer has been added', () => {
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
    it('does not give background layers with the visible layers', async () => {
        await store.dispatch('setBackground', { bgLayer: bgLayer.id, dispatcher: 'unit-test' })
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
    it('adds correctly a layer to the visible layers after it is added to the map', async () => {
        store.dispatch('addLayer', { layer: firstLayer, dispatcher: 'unit-test' })
        expect(getVisibleLayers()).to.be.an('Array').lengthOf(1)
        const [layer] = getVisibleLayers()
        expect(layer).to.be.an.instanceof(AbstractLayer)
        expect(layer.id).to.eq(firstLayer.id)
    })
    it('removes a layer from the visible layers as soon as its visibility is toggled', async () => {
        expect(getVisibleLayers()).to.be.an('Array').empty
        store.dispatch('addLayer', { layer: firstLayer, dispatcher: 'unit-test' })
        expect(getVisibleLayers()).to.be.an('Array').lengthOf(1)
        await store.dispatch('toggleLayerVisibility', {
            index: 0,
            dispatcher: 'unit-test',
        })
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
    it('does not adds a layer to the visible layers if its visible flag is set to false when added', async () => {
        const invisibleLayer = firstLayer.clone()
        invisibleLayer.visible = false
        await store.dispatch('setLayersConfig', [bgLayer, invisibleLayer, secondLayer])
        store.dispatch('addLayer', { layer: invisibleLayer, dispatcher: 'unit-test' })
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
})

// TODO zindex unit tests
// describe('Layer z-index are calculated correctly in the store', () => {
//     const getZIndex = (layer) => store.getters.zIndexForVisibleLayer(layer)

//     beforeEach(async () => {
//         await resetStore()
//         await store.dispatch('setLayerConfig', {
//             config: [bgLayer, firstLayer, secondLayer],
//             dispatcher: 'unit-test',
//         })
//         // setting up the background layer
//         await store.dispatch('setBackground', { bgLayer: bgLayer, dispatcher: 'unit-test' })
//     })

//     it('gives a z-index of -1 if the given layer is not valid', () => {
//         expect(getZIndex(null)).to.eq(-1)
//         expect(getZIndex(undefined)).to.eq(-1)
//         expect(getZIndex({})).to.eq(-1)
//         expect(getZIndex('')).to.eq(-1)
//         expect(getZIndex(0)).to.eq(-1)
//         expect(getZIndex(true)).to.eq(-1)
//     })

//     it('counts the BG layer', async () => {
//         store.dispatch('addLayer', { layer: firstLayer, dispatcher: 'unit-test' })
//         expect(getZIndex(firstLayer)).to.eq(1) // BG layer takes the 0 spot
//     })

//     it('counts two non group layer correctly', async () => {
//         store.dispatch('addLayer', { layer: firstLayer, dispatcher: 'unit-test' })
//         store.dispatch('addLayer', { layer: secondLayer, dispatcher: 'unit-test' })
//         expect(getZIndex(firstLayer)).to.eq(1)
//         expect(getZIndex(secondLayer)).to.eq(2)
//     })

//     it('counts a group layers correctly', async () => {
//         const baseUrl = 'https://wms.com'
//         const groupLayer = new ExternalGroupOfLayers({
//             name: 'group',
//             baseUrl,
//             externalLayerId: 'group',
//             layers: [
//                 new ExternalWMSLayer({
//                     name: 'Layer 1',
//                     externalLayerId: 'layer1',
//                     baseUrl,
//                 }),
//                 new ExternalWMSLayer({
//                     name: 'Layer 2',
//                     externalLayerId: 'layer2',
//                     baseUrl,
//                 }),
//                 new ExternalWMSLayer({
//                     name: 'Layer 3',
//                     externalLayerId: 'layer3',
//                     baseUrl,
//                 }),
//                 new ExternalWMSLayer({
//                     name: 'Layer 4',
//                     externalLayerId: 'layer4',
//                     baseUrl,
//                 }),
//             ],
//         })
//         await store.dispatch('addLayer', { layer: firstLayer, dispatcher: 'unit-test' })
//         await store.dispatch('addLayer', { layer: groupLayer, dispatcher: 'unit-test' })
//         await store.dispatch('addLayer', { layer: secondLayer, dispatcher: 'unit-test' })
//         expect(getZIndex(firstLayer)).to.eq(1)
//         expect(getZIndex(groupLayer)).to.eq(2)
//         expect(getZIndex(secondLayer)).to.eq(6)
//     })
// })
