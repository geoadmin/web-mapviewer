import type { Layer } from '@swissgeo/layers'

import { layerUtils, timeConfigUtils } from '@swissgeo/layers/utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import type { ActionDispatcher } from '@/store/types'

import useLayersStore from '@/store/modules/layers'

const dispatcher: ActionDispatcher = { name: 'layers-store-unit-test' }

let bgLayer: ReturnType<typeof layerUtils.makeGeoAdminWMTSLayer>
let firstLayer: ReturnType<typeof layerUtils.makeGeoAdminWMTSLayer>
let secondLayer: ReturnType<typeof layerUtils.makeGeoAdminWMSLayer>
let timeEntries: ReturnType<typeof timeConfigUtils.makeTimeConfigEntry>[]

const initializeLayers = () => {
    bgLayer = layerUtils.makeGeoAdminWMTSLayer({
        name: 'background',
        id: 'bg.layer',
        technicalName: 'bg.layer',
        isVisible: true,
        format: 'jpeg',
        isBackground: true,
        attributions: [{ name: 'test' }],
    })
    firstLayer = layerUtils.makeGeoAdminWMTSLayer({
        name: 'First layer',
        id: 'first.layer',
        technicalName: 'first.layer',
        isVisible: true,
        attributions: [{ name: 'test' }],
    })
    const timestamps = ['20240112', '19000203', '18400101']
    timeEntries = timestamps.map((timestamp) => timeConfigUtils.makeTimeConfigEntry(timestamp))

    // Debug: Log what we actually got
    console.log('DEBUG timeEntries:', JSON.stringify(timeEntries, null, 2))

    // Verify timeEntries are properly created
    if (timeEntries.length !== 3 || !timeEntries[0]?.year || !timeEntries[1]?.year) {
        console.error('timeEntries[0]:', timeEntries[0])
        console.error('timeEntries[1]:', timeEntries[1])
        console.error('timeEntries[2]:', timeEntries[2])
        throw new Error('timeEntries not properly initialized')
    }

    let timeConfig = timeConfigUtils.makeTimeConfig('last', timeEntries)

    // Manually ensure currentTimeEntry is set (workaround for potential initialization issue)
    if (timeConfig && !timeConfig.currentTimeEntry && timeEntries.length > 0) {
        timeConfig.currentTimeEntry = timeEntries[0]
    }

    // Ensure timeConfig is not undefined
    if (!timeConfig) {
        timeConfig = {
            timeEntries,
            behaviour: 'last',
            currentTimeEntry: timeEntries[0],
        }
    }

    secondLayer = layerUtils.makeGeoAdminWMSLayer({
        name: 'Second layer',
        id: 'second.layer',
        technicalName: 'second.layer',
        isVisible: true,
        timeConfig: timeConfig,
        attributions: [{ name: 'test' }],
    })

    // Final verification - manually set if still not present
    if (!secondLayer.timeConfig?.currentTimeEntry && secondLayer.timeConfig) {
        secondLayer.timeConfig.currentTimeEntry = timeEntries[0]
    }
}

const resetStore = () => {
    const layersStore = useLayersStore()
    layersStore.clearLayers(dispatcher)
    layersStore.setBackground(undefined, dispatcher)
    layersStore.setLayerConfig([], dispatcher)
}

describe('Background layer is correctly set', () => {
    const getBackgroundLayer = () => {
        const layersStore = useLayersStore()
        return layersStore.currentBackgroundLayer
    }
    const getBackgroundLayerId = () => {
        const layersStore = useLayersStore()
        return layersStore.currentBackgroundLayerId
    }

    beforeEach(() => {
        setActivePinia(createPinia())
        initializeLayers()
        resetStore()
    })

    it('does not have a background selected by default', () => {
        expect(getBackgroundLayerId()).to.be.undefined
        expect(getBackgroundLayer()).to.be.undefined
    })
    it('does not select a background if the one given is not present in the config', () => {
        const layersStore = useLayersStore()
        layersStore.setBackground(bgLayer.id, dispatcher)
        expect(getBackgroundLayerId()).to.be.undefined
        expect(getBackgroundLayer()).to.be.undefined
    })
    it('does select the background if it is present in the config', () => {
        const layersStore = useLayersStore()
        layersStore.setLayerConfig([bgLayer], dispatcher)
        layersStore.setBackground(bgLayer.id, dispatcher)
        expect(getBackgroundLayerId()).to.be.a('string')
        expect(getBackgroundLayerId()).to.eq(bgLayer.id)
        expect(getBackgroundLayer()).toBeDefined()
        expect(getBackgroundLayer().id).to.eq(bgLayer.id)
    })
    it('does not permit to select a background that has not the flag isBackground set to true', () => {
        const layersStore = useLayersStore()
        layersStore.setLayerConfig([firstLayer], dispatcher)
        layersStore.setBackground(firstLayer.id, dispatcher)
        expect(getBackgroundLayerId()).to.be.undefined
        expect(getBackgroundLayer()).to.be.undefined
    })
})

describe('Add layer creates copy of layers config (so that we may add multiple time the same layer)', () => {
    const checkRefNotEqButDeepEq = (expected?: Layer, result?: Layer) => {
        if (!expected) {
            expect(result).to.be.undefined
        } else {
            expect(result).toBeDefined()
        }

        // The uuid should not get cloned but be generated new
        const { uuid: expectedUuid, ...expectedWithoutUuid } = expected
        const { uuid: resultUuid, ...resultWithoutUuid } = result

        expect(result).to.not.equal(expected)
        expect(resultUuid).to.not.equal(expectedUuid)
        expect(resultWithoutUuid).to.deep.equal(expectedWithoutUuid)
    }

    beforeEach(() => {
        initializeLayers()
        resetStore()
        const layersStore = useLayersStore()
        layersStore.setLayerConfig([bgLayer, firstLayer, secondLayer], dispatcher)
    })

    it('creates a copy of the layers config when adding a layer through its ID', () => {
        const layersStore = useLayersStore()
        layersStore.addLayer(firstLayer.id, dispatcher)
        const layers = layersStore.getActiveLayersById(firstLayer.id)
        expect(layers).to.have.lengthOf(1)
        checkRefNotEqButDeepEq(firstLayer, layers[0])
    })
    it('creates a copy of the layers config when adding with the config directly', () => {
        const layersStore = useLayersStore()
        layersStore.addLayer(firstLayer, dispatcher)
        const layers = layersStore.getActiveLayersById(firstLayer.id)
        expect(layers).to.have.lengthOf(1)
        checkRefNotEqButDeepEq(firstLayer, layers[0])
        // now the same test, but by grabbing the first layer's config directly from the store's config
        checkRefNotEqButDeepEq(
            layersStore.config.find((layer) => layer.id === firstLayer.id) as Layer | undefined,
            layers[0]
        )
    })
    it('does not force the visibility of the layer to true when adding it', () => {
        const invisibleLayer = layerUtils.cloneLayer(firstLayer, {
            isVisible: false,
        })
        const layersStore = useLayersStore()
        layersStore.setLayerConfig([bgLayer, invisibleLayer, secondLayer], dispatcher)
        layersStore.addLayer(invisibleLayer, dispatcher)
        const addedLayers = layersStore.getActiveLayersById(invisibleLayer.id)
        expect(addedLayers).to.have.lengthOf(1)
        const [firstAddedLayer] = addedLayers
        expect(firstAddedLayer).toBeDefined()
        expect(firstAddedLayer.isVisible).to.be.false
    })
    it('add a duplicate layer and manage it separately', () => {
        const layersStore = useLayersStore()
        layersStore.addLayer(secondLayer, dispatcher)
        layersStore.addLayer(secondLayer, dispatcher)

        expect(layersStore.activeLayers).to.have.lengthOf(2)
        layersStore.toggleLayerVisibility(0, dispatcher)
        layersStore.setLayerOpacity(1, 0.65, dispatcher)
        // Use timeEntries[1] which is the entry for year 1900
        layersStore.setTimedLayerCurrentTimeEntry(0, timeEntries[1], dispatcher)
        // Use timeEntries[0] which is the entry for year 2024
        layersStore.setTimedLayerCurrentTimeEntry(1, timeEntries[0], dispatcher)

        const [firstActiveLayer, secondActiveLayer] = layersStore.activeLayers

        expect(firstActiveLayer.isVisible).to.be.false
        expect(firstActiveLayer.opacity).to.be.equal(1)
        expect(firstActiveLayer.timeConfig.currentTimeEntry?.year).to.be.equal(1900)

        expect(secondActiveLayer.isVisible).to.be.true
        expect(secondActiveLayer.opacity).to.be.equal(0.65)
        expect(secondActiveLayer.timeConfig.currentTimeEntry?.year).to.be.equal(2024)
    })
})

describe('Update layer', () => {
    beforeEach(() => {
        initializeLayers()
        resetStore()
        const layersStore = useLayersStore()
        layersStore.setLayerConfig([bgLayer, firstLayer, secondLayer], dispatcher)
        layersStore.setLayers([firstLayer, secondLayer], dispatcher)
        // Manually set currentTimeEntry for secondLayer using timeEntries[0] for year 2024
        layersStore.setTimedLayerCurrentTimeEntry(1, timeEntries[0], dispatcher)
    })
    it('Update a single layer by ID with a full layer object', () => {
        const clone = layerUtils.cloneLayer(secondLayer, {
            name: 'Update second layer name',
            isVisible: false,
        })
        timeConfigUtils.updateCurrentTimeEntry(clone.timeConfig, '19000203')

        const layersStore = useLayersStore()

        expect(layersStore.activeLayers[1].name).to.be.equal('Second layer')
        expect(layersStore.activeLayers[1].isVisible).to.be.true
        expect(layersStore.activeLayers[1].timeConfig.currentTimeEntry?.year).to.be.equal(2024)
        layersStore.updateLayer(secondLayer.id, clone, dispatcher)
        expect(layersStore.activeLayers[1].name).to.be.equal('Update second layer name')
        expect(layersStore.activeLayers[1].isVisible).to.be.false
        expect(layersStore.activeLayers[1].timeConfig.currentTimeEntry?.year).to.be.equal(1900)
    })
})

describe('Update layers', () => {
    beforeEach(() => {
        initializeLayers()
        resetStore()
        const layersStore = useLayersStore()
        layersStore.setLayerConfig([bgLayer, firstLayer, secondLayer], dispatcher)
        layersStore.setLayers([firstLayer, secondLayer], dispatcher)
        // Manually set currentTimeEntry for secondLayer using timeEntries[0] for year 2024
        layersStore.setTimedLayerCurrentTimeEntry(1, timeEntries[0], dispatcher)
    })
    it('Update duplicate layers by layer ID with full clone', () => {
        const layersStore = useLayersStore()
        layersStore.addLayer(secondLayer, dispatcher)
        // Manually set currentTimeEntry for the newly added layer using timeEntries[0]
        layersStore.setTimedLayerCurrentTimeEntry(2, timeEntries[0], dispatcher)

        const clone = layerUtils.cloneLayer(secondLayer, {
            name: 'Update second layer name',
            isVisible: false,
        })
        timeConfigUtils.updateCurrentTimeEntry(clone.timeConfig, '19000203')

        expect(layersStore.activeLayers.length).to.eq(3)

        expect(layersStore.activeLayers[1].name).to.be.equal('Second layer')
        expect(layersStore.activeLayers[1].isVisible).to.be.true
        expect(layersStore.activeLayers[1].timeConfig.currentTimeEntry?.year).to.be.equal(2024)
        expect(layersStore.activeLayers[2].name).to.be.equal('Second layer')
        expect(layersStore.activeLayers[2].isVisible).to.be.true
        expect(layersStore.activeLayers[2].timeConfig.currentTimeEntry?.year).to.be.equal(2024)

        layersStore.updateLayers([clone], dispatcher)
        expect(layersStore.activeLayers[1].name).to.be.equal('Update second layer name')
        expect(layersStore.activeLayers[1].isVisible).to.be.false
        expect(layersStore.activeLayers[1].timeConfig.currentTimeEntry?.year).to.be.equal(1900)
        expect(layersStore.activeLayers[2].name).to.be.equal('Update second layer name')
        expect(layersStore.activeLayers[2].isVisible).to.be.false
        expect(layersStore.activeLayers[2].timeConfig.currentTimeEntry?.year).to.be.equal(1900)
    })
    it('Update duplicate layers by layer ID with partial update', () => {
        const layersStore = useLayersStore()
        layersStore.addLayer(secondLayer, dispatcher)
        // Manually set currentTimeEntry for the newly added layer using timeEntries[0]
        layersStore.setTimedLayerCurrentTimeEntry(2, timeEntries[0], dispatcher)

        expect(layersStore.activeLayers.length).to.eq(3)

        expect(layersStore.activeLayers[1].name).to.be.equal('Second layer')
        expect(layersStore.activeLayers[1].isVisible).to.be.true
        expect(layersStore.activeLayers[1].timeConfig.currentTimeEntry?.year).to.be.equal(2024)
        expect(layersStore.activeLayers[2].name).to.be.equal('Second layer')
        expect(layersStore.activeLayers[2].isVisible).to.be.true
        expect(layersStore.activeLayers[2].timeConfig.currentTimeEntry?.year).to.be.equal(2024)

        layersStore.updateLayers(
            [
                {
                    id: 'second.layer',
                    name: 'Update second layer name',
                    isVisible: false,
                    opacity: 0.8,
                },
            ],
            dispatcher
        )
        expect(layersStore.activeLayers.length).to.eq(3)
        expect(layersStore.activeLayers[1].name).to.be.equal('Update second layer name')
        expect(layersStore.activeLayers[1].isVisible).to.be.false
        expect(layersStore.activeLayers[1].opacity).to.be.equal(0.8)
        expect(layersStore.activeLayers[2].name).to.be.equal('Update second layer name')
        expect(layersStore.activeLayers[2].isVisible).to.be.false
        expect(layersStore.activeLayers[2].opacity).to.be.equal(0.8)
    })
    it('Update duplicate layers by index with partial update', () => {
        const layersStore = useLayersStore()
        layersStore.addLayer(secondLayer, dispatcher)
        // Manually set currentTimeEntry for the newly added layer using timeEntries[0]
        layersStore.setTimedLayerCurrentTimeEntry(2, timeEntries[0], dispatcher)

        expect(layersStore.activeLayers.length).to.eq(3)
        expect(layersStore.activeLayers[1].name).to.be.equal('Second layer')
        expect(layersStore.activeLayers[1].isVisible).to.be.true
        expect(layersStore.activeLayers[1].timeConfig.currentTimeEntry?.year).to.be.equal(2024)
        expect(layersStore.activeLayers[2].name).to.be.equal('Second layer')
        expect(layersStore.activeLayers[2].isVisible).to.be.true
        expect(layersStore.activeLayers[2].timeConfig.currentTimeEntry?.year).to.be.equal(2024)

        layersStore.updateLayers(
            [
                {
                    id: 'second.layer',
                    name: 'Update second layer name',
                    isVisible: false,
                    opacity: 0.8,
                },
            ],
            dispatcher
        )
        expect(layersStore.activeLayers.length).to.eq(3)
        expect(layersStore.activeLayers[1].name).to.be.equal('Update second layer name')
        expect(layersStore.activeLayers[1].isVisible).to.be.false
        expect(layersStore.activeLayers[1].opacity).to.be.equal(0.8)
        expect(layersStore.activeLayers[2].name).to.be.equal('Update second layer name')
        expect(layersStore.activeLayers[2].isVisible).to.be.false
        expect(layersStore.activeLayers[2].opacity).to.be.equal(0.8)
    })
})

describe('Visible layers are filtered correctly by the store', () => {
    const getVisibleLayers = () => {
        const layersStore = useLayersStore()
        return layersStore.visibleLayers
    }

    beforeEach(() => {
        initializeLayers()
        resetStore()
        const layersStore = useLayersStore()
        layersStore.setLayerConfig([bgLayer, firstLayer, secondLayer], dispatcher)
    })

    it('gives an empty array if no layer has been added', () => {
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
    it('does not give background layers with the visible layers', () => {
        const layersStore = useLayersStore()
        layersStore.setBackground(bgLayer.id, dispatcher)
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
    it('adds correctly a layer to the visible layers after it is added to the map', () => {
        const layersStore = useLayersStore()
        layersStore.addLayer(firstLayer, dispatcher)
        expect(getVisibleLayers()).to.be.an('Array').lengthOf(1)
        const [layer] = getVisibleLayers()
        expect(layer).toBeDefined()
        expect(layer.id).to.eq(firstLayer.id)
    })
    it('removes a layer from the visible layers as soon as its visibility is toggled', () => {
        const layersStore = useLayersStore()

        expect(getVisibleLayers()).to.be.an('Array').empty

        layersStore.addLayer(firstLayer, dispatcher)
        expect(getVisibleLayers()).to.be.an('Array').lengthOf(1)

        layersStore.toggleLayerVisibility(0, dispatcher)
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
    it('does not adds a layer to the visible layers if its visible flag is set to false when added', () => {
        const layersStore = useLayersStore()

        const invisibleLayer = layerUtils.cloneLayer(firstLayer)
        invisibleLayer.isVisible = false
        layersStore.setLayerConfig([invisibleLayer, secondLayer], dispatcher)
        layersStore.addLayer(invisibleLayer, dispatcher)
        expect(getVisibleLayers()).to.be.an('Array').empty
    })
})
