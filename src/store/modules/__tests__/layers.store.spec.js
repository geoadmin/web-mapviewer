import { expect } from 'chai'
import { beforeEach, describe, it } from 'vitest'

import AbstractLayer from '@/api/layers/AbstractLayer.class'
import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import store from '@/store'

const bgLayer = new GeoAdminWMTSLayer(
    'background',
    'bg.layer',
    'bg.layer',
    1.0,
    true,
    [],
    'jpeg',
    null,
    true
)
const firstLayer = new GeoAdminWMTSLayer('First layer', 'first.layer', 1.0, 'first.layer', true, [])
const secondLayer = new GeoAdminWMSLayer(
    'Second layer',
    'second.layer',
    'second.layer',
    1.0,
    true,
    [],
    '',
    'png',
    new LayerTimeConfig()
)

const resetStore = async () => {
    await store.dispatch('clearLayers')
    await store.dispatch('setBackground', null)
    await store.dispatch('setLayerConfig', [])
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
        await store.dispatch('setBackground', bgLayer.getID())
        expect(getBackgroundLayer()).to.be.null
    })
    it('does select the background if it is present in the config', async () => {
        await store.dispatch('setLayerConfig', [bgLayer])
        await store.dispatch('setBackground', bgLayer.getID())
        expect(getBackgroundLayer()).to.be.an.instanceof(AbstractLayer)
        expect(getBackgroundLayer().getID()).to.eq(bgLayer.getID())
    })
    it('does not permit to select a background that has not the flag isBackground set to true', async () => {
        await store.dispatch('setLayerConfig', [firstLayer])
        await store.dispatch('setBackground', firstLayer.getID())
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
        await store.dispatch('setLayerConfig', [bgLayer, firstLayer, secondLayer])
    })
    it('creates a copy of the layers config when adding a layer through its ID', async () => {
        await store.dispatch('addLayer', firstLayer.getID())
        checkRefNotEqButDeepEq(firstLayer, store.getters.getActiveLayerById(firstLayer.getID()))
    })
    it('creates a copy of the layers config when adding with the config directly', async () => {
        await store.dispatch('addLayer', firstLayer)
        checkRefNotEqButDeepEq(firstLayer, store.getters.getActiveLayerById(firstLayer.getID()))
        // now the same test, but by grabbing the first layer's config directly from the store's config
        checkRefNotEqButDeepEq(
            store.state.layers.config.find((layer) => layer.getID() === firstLayer.getID()),
            store.getters.getActiveLayerById(firstLayer.getID())
        )
    })
    it('does not force the visibility of the layer to true when adding it', async () => {
        const invisibleLayer = firstLayer.clone()
        invisibleLayer.visible = false
        await store.dispatch('setLayerConfig', [bgLayer, invisibleLayer, secondLayer])
        await store.dispatch('addLayer', invisibleLayer)
        const addedLayer = store.getters.getActiveLayerById(invisibleLayer.getID())
        expect(addedLayer).to.be.an.instanceof(AbstractLayer)
        expect(addedLayer.visible).to.be.false
    })
})

describe('Visible layers are filtered correctly by the store', () => {
    const getVisibleLayers = () => store.getters.visibleLayers

    beforeEach(async () => {
        await resetStore()
        await store.dispatch('setLayerConfig', [bgLayer, firstLayer, secondLayer])
    })

    it('gives an empty array if no layer has been added', () => {
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
    it('does not give background layers with the visible layers', async () => {
        await store.dispatch('setBackground', bgLayer.getID())
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
    it('adds correctly a layer to the visible layers after it is added to the map', async () => {
        await store.dispatch('addLayer', firstLayer)
        expect(getVisibleLayers()).to.be.an('Array').lengthOf(1)
        const [layer] = getVisibleLayers()
        expect(layer).to.be.an.instanceof(AbstractLayer)
        expect(layer.getID()).to.eq(firstLayer.getID())
    })
    it('removes a layer from the visible layers as soon as its visibility is toggled', async () => {
        expect(getVisibleLayers()).to.be.an('Array').empty
        await store.dispatch('addLayer', firstLayer)
        expect(getVisibleLayers()).to.be.an('Array').lengthOf(1)
        await store.dispatch('toggleLayerVisibility', firstLayer)
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
    it('does not adds a layer to the visible layers if its visible flag is set to false when added', async () => {
        const invisibleLayer = firstLayer.clone()
        invisibleLayer.visible = false
        await store.dispatch('setLayersConfig', [bgLayer, invisibleLayer, secondLayer])
        await store.dispatch('addLayer', invisibleLayer)
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
})

describe('Layer z-index are calculated correctly in the store', () => {
    const getZIndex = (layer) => store.getters.zIndexForVisibleLayer(layer)

    beforeEach(async () => {
        await resetStore()
        await store.dispatch('setLayerConfig', [bgLayer, firstLayer, secondLayer])
        // setting up the background layer
        await store.dispatch('setBackground', bgLayer)
    })

    it('gives a z-index of -1 if the given layer is not valid', () => {
        expect(getZIndex(null)).to.eq(-1)
        expect(getZIndex(undefined)).to.eq(-1)
        expect(getZIndex({})).to.eq(-1)
        expect(getZIndex('')).to.eq(-1)
        expect(getZIndex(0)).to.eq(-1)
        expect(getZIndex(true)).to.eq(-1)
    })

    it('counts the BG layer', async () => {
        await store.dispatch('addLayer', firstLayer)
        expect(getZIndex(firstLayer)).to.eq(1) // BG layer takes the 0 spot
    })

    it('counts two non group layer correctly', async () => {
        await store.dispatch('addLayer', firstLayer)
        await store.dispatch('addLayer', secondLayer)
        expect(getZIndex(firstLayer)).to.eq(1)
        expect(getZIndex(secondLayer)).to.eq(2)
    })

    it('counts a group layers correctly', async () => {
        const groupLayer = new ExternalGroupOfLayers(
            'group',
            1.0,
            true,
            'https://wms.com',
            'group',
            [
                new ExternalWMSLayer('Layer 1', 1.0, true, '...', 'layer1', [], ''),
                new ExternalWMSLayer('Layer 2', 1.0, true, '...', 'layer2', [], ''),
                new ExternalWMSLayer('Layer 3', 1.0, true, '...', 'layer3', [], ''),
                new ExternalWMSLayer('Layer 4', 1.0, true, '...', 'layer4', [], ''),
            ]
        )
        await store.dispatch('addLayer', firstLayer)
        await store.dispatch('addLayer', groupLayer)
        await store.dispatch('addLayer', secondLayer)
        expect(getZIndex(firstLayer)).to.eq(1)
        expect(getZIndex(groupLayer)).to.eq(2)
        expect(getZIndex(secondLayer)).to.eq(6)
    })
})
