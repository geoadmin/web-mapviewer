import { beforeEach, describe, expect, it, vi } from 'vitest'

const lifecycle = vi.hoisted(() => ({ mounted: null, beforeUnmount: null }))
const cesium = vi.hoisted(() => {
    function createEvent() {
        const listeners = new Set()
        return {
            addEventListener: vi.fn((listener) => {
                listeners.add(listener)
                return () => listeners.delete(listener)
            }),
            raise(...args) {
                for (const listener of [...listeners]) {
                    listener(...args)
                }
            },
            size() {
                return listeners.size
            },
        }
    }

    class Collection {
        constructor() {
            this.add = vi.fn((value) => value)
            this.remove = vi.fn()
        }
    }

    return {
        createEvent,
        fromUrl: vi.fn(),
        labelCollections: [],
        polylineCollections: [],
        Collection,
    }
})

vi.mock('vue', () => ({
    onMounted: (callback) => {
        lifecycle.mounted = callback
    },
    onBeforeUnmount: (callback) => {
        lifecycle.beforeUnmount = callback
    },
}))

vi.mock('cesium', () => {
    class Color {
        static WHITE = new Color()

        static fromCssColorString() {
            return new Color()
        }

        withAlpha() {
            return this
        }
    }

    class LabelCollection extends cesium.Collection {
        constructor() {
            super()
            cesium.labelCollections.push(this)
        }
    }

    class PolylineCollection extends cesium.Collection {
        constructor() {
            super()
            cesium.polylineCollections.push(this)
        }
    }

    return {
        Cartesian2: class {},
        Cartesian3: { fromDegrees: vi.fn((...coordinates) => coordinates) },
        Cesium3DTileStyle: class {},
        Cesium3DTileset: { fromUrl: cesium.fromUrl },
        Color,
        DistanceDisplayCondition: class {},
        HorizontalOrigin: { CENTER: 'center' },
        LabelCollection,
        LabelStyle: { FILL: 'fill' },
        NearFarScalar: class {},
        PolylineCollection,
        VerticalOrigin: { BOTTOM: 'bottom' },
    }
})

import useSwissnamesLabelsRenderer from '@/modules/map/components/cesium/utils/useSwissnamesLabelsRenderer.composable'

describe('useSwissnamesLabelsRenderer', () => {
    beforeEach(() => {
        lifecycle.mounted = null
        lifecycle.beforeUnmount = null
        cesium.fromUrl.mockReset()
        cesium.labelCollections.length = 0
        cesium.polylineCollections.length = 0
    })

    it('keeps labels until Cesium unloads their tile', async () => {
        const postRender = cesium.createEvent()
        const preUpdate = cesium.createEvent()
        const tileVisible = cesium.createEvent()
        const tileUnload = cesium.createEvent()
        const loadedTileset = { tileVisible, tileUnload, style: null, destroy: vi.fn() }
        cesium.fromUrl.mockResolvedValue(loadedTileset)
        const primitives = {
            add: vi.fn((primitive) => primitive),
            remove: vi.fn(),
        }
        const scene = {
            postRender,
            preUpdate,
            primitives,
            requestRender: vi.fn(),
        }
        const viewer = { scene }

        useSwissnamesLabelsRenderer(() => viewer, {
            baseUrl: 'https://example.test/',
            id: 'swissnames/',
            urlTimestampToUse: 'current',
        })

        const initialization = lifecycle.mounted()
        await initialization

        expect(cesium.fromUrl).toHaveBeenCalledOnce()
        expect(postRender.size()).toBe(1)
        expect(preUpdate.size()).toBe(0)

        const feature = {
            getProperty: vi.fn((property) => {
                const values = {
                    longitude: 7.9,
                    latitude: 46.7,
                    groundHeight: 600,
                    labelHeight: 620,
                    maxDistance: 10000,
                    text: 'Brienzersee',
                    fontSize: 14,
                    type: 'SEE',
                }
                return values[property]
            }),
        }
        const tile = { content: { featuresLength: 1, getFeature: () => feature } }
        tileVisible.raise(tile)
        expect(cesium.labelCollections[0].add).not.toHaveBeenCalled()

        postRender.raise()
        expect(cesium.labelCollections[0].add).toHaveBeenCalledOnce()
        expect(cesium.polylineCollections[0].add).toHaveBeenCalledOnce()

        postRender.raise()
        expect(cesium.labelCollections[0].remove).not.toHaveBeenCalled()
        expect(cesium.polylineCollections[0].remove).not.toHaveBeenCalled()

        tileUnload.raise(tile)
        postRender.raise()
        expect(cesium.labelCollections[0].remove).toHaveBeenCalledOnce()
        expect(cesium.polylineCollections[0].remove).toHaveBeenCalledOnce()

        lifecycle.beforeUnmount()
        expect(postRender.size()).toBe(0)
        expect(tileUnload.size()).toBe(0)
        expect(primitives.remove).toHaveBeenCalledTimes(3)
    })

    it('destroys a tileset that finishes loading after unmount', async () => {
        const loadedTileset = { destroy: vi.fn() }
        cesium.fromUrl.mockResolvedValue(loadedTileset)
        const primitives = {
            add: vi.fn((primitive) => primitive),
            remove: vi.fn(),
        }
        const scene = {
            primitives,
            requestRender: vi.fn(),
        }
        const viewer = { scene }

        useSwissnamesLabelsRenderer(() => viewer, {
            baseUrl: 'https://example.test/',
            id: 'swissnames/',
            urlTimestampToUse: 'current',
        })

        const initialization = lifecycle.mounted()
        lifecycle.beforeUnmount()
        await initialization

        expect(loadedTileset.destroy).toHaveBeenCalledOnce()
        expect(primitives.add).not.toHaveBeenCalled()
    })
})
