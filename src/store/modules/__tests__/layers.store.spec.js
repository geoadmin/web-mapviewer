import { expect } from 'chai'
import { beforeEach, describe, it } from 'vitest'

import AbstractLayer, { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import LayerTimeConfigEntry from '@/api/layers/LayerTimeConfigEntry.class'
// We need to import the router here to avoid error when initializing router plugins, this is
// needed since some store plugins might require access to router to get the query parameters
// (e.g. topic management plugin)
import router from '@/router' // eslint-disable-line no-unused-vars
import store from '@/store'

const dispatcher = { dispatcher: 'unit-test' }

const bgLayer = new GeoAdminWMTSLayer({
    name: 'background',
    id: 'bg.layer',
    technicalName: 'bg.layer',
    visible: true,
    format: 'jpeg',
    isBackground: true,
    attributions: [new LayerAttribution('test')],
})
const firstLayer = new GeoAdminWMTSLayer({
    name: 'First layer',
    id: 'first.layer',
    technicalName: 'first.layer',
    visible: true,
    attributions: [new LayerAttribution('test')],
})
const secondLayer = new GeoAdminWMSLayer({
    name: 'Second layer',
    id: 'second.layer',
    technicalName: 'second.layer',
    visible: true,
    timeConfig: new LayerTimeConfig('last', [
        new LayerTimeConfigEntry('20240112'),
        new LayerTimeConfigEntry('19000203'),
        new LayerTimeConfigEntry('18400101'),
    ]),
    attributions: [new LayerAttribution('test')],
})

const resetStore = () => {
    store.dispatch('clearLayers', dispatcher)
    store.dispatch('setBackground', { bgLayer: null, ...dispatcher })
    store.dispatch('setLayerConfig', { config: [], ...dispatcher })
}

describe('Background layer is correctly set', () => {
    const getBackgroundLayer = () => store.state.layers.currentBackgroundLayer

    beforeEach(() => {
        resetStore()
    })

    it('does not have a background selected by default', () => {
        expect(getBackgroundLayer()).to.be.null
    })
    it('does not select a background if the one given is not present in the config', () => {
        store.dispatch('setBackground', { bgLayer: bgLayer.id, ...dispatcher })
        expect(getBackgroundLayer()).to.be.null
    })
    it('does select the background if it is present in the config', () => {
        store.dispatch('setLayerConfig', { config: [bgLayer], ...dispatcher })
        store.dispatch('setBackground', { bgLayer: bgLayer.id, ...dispatcher })
        expect(getBackgroundLayer()).to.be.an.instanceof(AbstractLayer)
        expect(getBackgroundLayer().id).to.eq(bgLayer.id)
    })
    it('does not permit to select a background that has not the flag isBackground set to true', () => {
        store.dispatch('setLayerConfig', { config: [firstLayer], ...dispatcher })
        store.dispatch('setBackground', {
            bgLayer: firstLayer.id,
            ...dispatcher,
        })
        expect(getBackgroundLayer()).to.be.null
    })
})

describe('Add layer creates copy of layers config (so that we may add multiple time the same layer)', () => {
    const checkRefNotEqButDeepEq = (expected, result) => {
        expect(result).to.not.be.eq(expected)
        expect(result).to.deep.eq(expected)
    }

    beforeEach(() => {
        resetStore()
        store.dispatch('setLayerConfig', {
            config: [bgLayer, firstLayer, secondLayer],
            ...dispatcher,
        })
    })
    it('creates a copy of the layers config when adding a layer through its ID', () => {
        store.dispatch('addLayer', { layerId: firstLayer.id, ...dispatcher })
        const layers = store.getters.getActiveLayersById(firstLayer.id)
        expect(layers).to.have.lengthOf(1)
        checkRefNotEqButDeepEq(firstLayer, layers[0])
    })
    it('creates a copy of the layers config when adding with the config directly', () => {
        store.dispatch('addLayer', { layer: firstLayer, ...dispatcher })
        const layers = store.getters.getActiveLayersById(firstLayer.id)
        expect(layers).to.have.lengthOf(1)
        checkRefNotEqButDeepEq(firstLayer, layers[0])
        // now the same test, but by grabbing the first layer's config directly from the store's config
        checkRefNotEqButDeepEq(
            store.state.layers.config.find((layer) => layer.id === firstLayer.id),
            layers[0]
        )
    })
    it('does not force the visibility of the layer to true when adding it', () => {
        const invisibleLayer = firstLayer.clone()
        invisibleLayer.visible = false
        store.dispatch('setLayerConfig', {
            config: [bgLayer, invisibleLayer, secondLayer],
            ...dispatcher,
        })
        store.dispatch('addLayer', { layer: invisibleLayer, ...dispatcher })
        const addedLayers = store.getters.getActiveLayersById(invisibleLayer.id)
        expect(addedLayers).to.have.lengthOf(1)
        expect(addedLayers[0]).to.be.an.instanceof(AbstractLayer)
        expect(addedLayers[0].visible).to.be.false
    })
    it('add a duplicate layer and manage it separately', () => {
        store.dispatch(`addLayer`, { layer: secondLayer, ...dispatcher })
        store.dispatch(`addLayer`, { layer: secondLayer, ...dispatcher })
        expect(store.state.layers.activeLayers).to.have.lengthOf(2)
        store.dispatch(`toggleLayerVisibility`, { index: 0, ...dispatcher })
        store.dispatch(`setLayerOpacity`, { index: 1, opacity: 0.65, ...dispatcher })
        store.dispatch(`setTimedLayerCurrentYear`, { index: 0, year: 1900, ...dispatcher })
        expect(store.state.layers.activeLayers[0].visible).to.be.false
        expect(store.state.layers.activeLayers[1].visible).to.be.true
        expect(store.state.layers.activeLayers[0].opacity).to.be.equal(1)
        expect(store.state.layers.activeLayers[1].opacity).to.be.equal(0.65)
        expect(store.state.layers.activeLayers[0].timeConfig.currentYear).to.be.equal(1900)
        expect(store.state.layers.activeLayers[1].timeConfig.currentYear).to.be.equal(2024)
    })
})

describe('Update layer', () => {
    beforeEach(() => {
        resetStore()
        store.dispatch('setLayerConfig', {
            config: [bgLayer, firstLayer, secondLayer],
            ...dispatcher,
        })
        store.dispatch('setLayers', {
            layers: [firstLayer, secondLayer],
            ...dispatcher,
        })
    })
    it('Update a single layer by index with a full layer object', () => {
        const clone = secondLayer.clone()
        clone.name = 'Update second layer name'
        clone.visible = false
        clone.timeConfig.updateCurrentTimeEntry('19000203')
        expect(store.state.layers.activeLayers[1].name).to.be.equal('Second layer')
        expect(store.state.layers.activeLayers[1].visible).to.be.true
        expect(store.state.layers.activeLayers[1].timeConfig.currentYear).to.be.equal(2024)
        store.dispatch('updateLayer', { index: 1, layer: clone, ...dispatcher })
        expect(store.state.layers.activeLayers[1].name).to.be.equal('Update second layer name')
        expect(store.state.layers.activeLayers[1].visible).to.be.false
        expect(store.state.layers.activeLayers[1].timeConfig.currentYear).to.be.equal(1900)
    })
    it('Update a single layer with invalid index', () => {
        expect(() =>
            store.dispatch('updateLayer', {
                index: 5,
                layer: { name: 'Update second layer name', visible: false, opacity: 0.8 },
                ...dispatcher,
            })
        ).to.throw()
        expect(() =>
            store.dispatch('updateLayer', {
                layer: { name: 'Update second layer name', visible: false, opacity: 0.8 },
                ...dispatcher,
            })
        ).to.throw()
        expect(() =>
            store.dispatch('updateLayer', {
                index: -1,
                layer: { name: 'Update second layer name', visible: false, opacity: 0.8 },
                ...dispatcher,
            })
        ).to.throw()
    })
})

describe('Update layers', () => {
    beforeEach(() => {
        resetStore()
        store.dispatch('setLayerConfig', {
            config: [bgLayer, firstLayer, secondLayer],
            ...dispatcher,
        })
        store.dispatch('setLayers', {
            layers: [firstLayer, secondLayer],
            ...dispatcher,
        })
    })
    it('Update duplicate layers by layer ID with full clone', () => {
        store.dispatch('addLayer', { layer: secondLayer, ...dispatcher })
        const clone = secondLayer.clone()
        clone.name = 'Update second layer name'
        clone.visible = false
        clone.timeConfig.updateCurrentTimeEntry('19000203')
        expect(store.state.layers.activeLayers[1].name).to.be.equal('Second layer')
        expect(store.state.layers.activeLayers[1].visible).to.be.true
        expect(store.state.layers.activeLayers[1].timeConfig.currentYear).to.be.equal(2024)
        expect(store.state.layers.activeLayers[2].name).to.be.equal('Second layer')
        expect(store.state.layers.activeLayers[2].visible).to.be.true
        expect(store.state.layers.activeLayers[2].timeConfig.currentYear).to.be.equal(2024)
        store.dispatch('updateLayers', { layers: [clone], ...dispatcher })
        expect(store.state.layers.activeLayers[1].name).to.be.equal('Update second layer name')
        expect(store.state.layers.activeLayers[1].visible).to.be.false
        expect(store.state.layers.activeLayers[1].timeConfig.currentYear).to.be.equal(1900)
        expect(store.state.layers.activeLayers[2].name).to.be.equal('Update second layer name')
        expect(store.state.layers.activeLayers[2].visible).to.be.false
        expect(store.state.layers.activeLayers[2].timeConfig.currentYear).to.be.equal(1900)
    })
    it('Update duplicate layers by layer ID with partial update', () => {
        store.dispatch('addLayer', { layer: secondLayer, ...dispatcher })

        expect(store.state.layers.activeLayers[1].name).to.be.equal('Second layer')
        expect(store.state.layers.activeLayers[1].visible).to.be.true
        expect(store.state.layers.activeLayers[1].timeConfig.currentYear).to.be.equal(2024)
        expect(store.state.layers.activeLayers[2].name).to.be.equal('Second layer')
        expect(store.state.layers.activeLayers[2].visible).to.be.true
        expect(store.state.layers.activeLayers[2].timeConfig.currentYear).to.be.equal(2024)
        store.dispatch('updateLayers', {
            layers: [
                {
                    id: 'second.layer',
                    name: 'Update second layer name',
                    visible: false,
                    opacity: 0.8,
                },
            ],
            ...dispatcher,
        })
        expect(store.state.layers.activeLayers[1].name).to.be.equal('Update second layer name')
        expect(store.state.layers.activeLayers[1].visible).to.be.false
        expect(store.state.layers.activeLayers[1].opacity).to.be.equal(0.8)
        expect(store.state.layers.activeLayers[2].name).to.be.equal('Update second layer name')
        expect(store.state.layers.activeLayers[2].visible).to.be.false
        expect(store.state.layers.activeLayers[2].opacity).to.be.equal(0.8)
    })
    it('Update duplicate layers by index with partial update', () => {
        store.dispatch('addLayer', { layer: secondLayer, ...dispatcher })

        expect(store.state.layers.activeLayers[1].name).to.be.equal('Second layer')
        expect(store.state.layers.activeLayers[1].visible).to.be.true
        expect(store.state.layers.activeLayers[1].timeConfig.currentYear).to.be.equal(2024)
        expect(store.state.layers.activeLayers[2].name).to.be.equal('Second layer')
        expect(store.state.layers.activeLayers[2].visible).to.be.true
        expect(store.state.layers.activeLayers[2].timeConfig.currentYear).to.be.equal(2024)
        store.dispatch('updateLayers', {
            layers: [
                {
                    id: 'second.layer',
                    name: 'Update second layer name',
                    visible: false,
                    opacity: 0.8,
                },
            ],
            ...dispatcher,
        })
        expect(store.state.layers.activeLayers[1].name).to.be.equal('Update second layer name')
        expect(store.state.layers.activeLayers[1].visible).to.be.false
        expect(store.state.layers.activeLayers[1].opacity).to.be.equal(0.8)
        expect(store.state.layers.activeLayers[2].name).to.be.equal('Update second layer name')
        expect(store.state.layers.activeLayers[2].visible).to.be.false
        expect(store.state.layers.activeLayers[2].opacity).to.be.equal(0.8)
    })
})

describe('Visible layers are filtered correctly by the store', () => {
    const getVisibleLayers = () => store.getters.visibleLayers

    beforeEach(() => {
        resetStore()
        store.dispatch('setLayerConfig', {
            config: [bgLayer, firstLayer, secondLayer],
            ...dispatcher,
        })
    })

    it('gives an empty array if no layer has been added', () => {
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
    it('does not give background layers with the visible layers', () => {
        store.dispatch('setBackground', { bgLayer: bgLayer.id, ...dispatcher })
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
    it('adds correctly a layer to the visible layers after it is added to the map', () => {
        store.dispatch('addLayer', { layer: firstLayer, ...dispatcher })
        expect(getVisibleLayers()).to.be.an('Array').lengthOf(1)
        const [layer] = getVisibleLayers()
        expect(layer).to.be.an.instanceof(AbstractLayer)
        expect(layer.id).to.eq(firstLayer.id)
    })
    it('removes a layer from the visible layers as soon as its visibility is toggled', () => {
        expect(getVisibleLayers()).to.be.an('Array').empty
        store.dispatch('addLayer', { layer: firstLayer, ...dispatcher })
        expect(getVisibleLayers()).to.be.an('Array').lengthOf(1)
        store.dispatch('toggleLayerVisibility', {
            index: 0,
            ...dispatcher,
        })
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
    it('does not adds a layer to the visible layers if its visible flag is set to false when added', () => {
        const invisibleLayer = firstLayer.clone()
        invisibleLayer.visible = false
        store.dispatch('setLayersConfig', [bgLayer, invisibleLayer, secondLayer])
        store.dispatch('addLayer', { layer: invisibleLayer, ...dispatcher })
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
})
