import { expect } from 'chai'
import { afterEach, describe, it, vi } from 'vitest'

import { createSwissnamesTileLoader } from '@/modules/map/components/cesium/utils/swissnamesTileLoader'

const ENTRY = {
    key: 'zoomlevel4/11/1071/724',
    layer: { id: 'zoomlevel4' },
    tile: { z: 11, x: 1071, y: 724 },
}

async function flushPromises() {
    await Promise.resolve()
    await Promise.resolve()
}

afterEach(() => {
    vi.useRealTimers()
})

describe('Swissnames tile loader', () => {
    it('cancels invisible requests without blocking later loads', async () => {
        const signals = []
        let loadCount = 0

        const loadFeatures = (_layer, _tile, signal) => {
            loadCount += 1
            signals.push(signal)
            return new Promise((_resolve, reject) => {
                signal.addEventListener(
                    'abort',
                    () => {
                        const error = new Error('Aborted')
                        error.name = 'AbortError'
                        reject(error)
                    },
                    { once: true }
                )
            })
        }

        const loader = createSwissnamesTileLoader({
            canRenderLabels: () => true,
            getEntities: () => null,
            loadFeatures,
            requestRender: () => {},
            retry: () => {},
        })

        loader.setVisibleEntries([ENTRY])
        expect(loadCount).to.equal(1)
        expect(signals[0].aborted).to.equal(false)

        loader.setVisibleEntries([])
        expect(signals[0].aborted).to.equal(true)
        await flushPromises()

        loader.setVisibleEntries([ENTRY])
        expect(loadCount).to.equal(2)
        expect(signals[1].aborted).to.equal(false)

        loader.clear()
        expect(signals[1].aborted).to.equal(true)

        loader.setVisibleEntries([ENTRY])
        expect(loadCount).to.equal(3)
        await flushPromises()
        loader.setVisibleEntries([])
        expect(signals[2].aborted).to.equal(true)
        await flushPromises()

        const pendingEntries = Array.from({ length: 32 }, (_value, index) => ({
            key: `zoomlevel4/11/${index}/0`,
            layer: ENTRY.layer,
            tile: { z: 11, x: index, y: 0 },
        }))
        loader.setVisibleEntries(pendingEntries)
        expect(loadCount).to.equal(35)

        const replacementEntry = {
            key: 'zoomlevel4/11/32/0',
            layer: ENTRY.layer,
            tile: { z: 11, x: 32, y: 0 },
        }
        loader.setVisibleEntries([replacementEntry])
        expect(signals.slice(3, 35).every((signal) => signal.aborted)).to.equal(true)
        expect(loadCount).to.equal(35)

        await flushPromises()
        loader.setVisibleEntries([replacementEntry])
        expect(loadCount).to.equal(36)
        expect(signals[35].aborted).to.equal(false)

        loader.clear()
        await flushPromises()
    })

    it('retries failed tiles once', async () => {
        vi.useFakeTimers()
        const persistentEntry = {
            key: 'zoomlevel4/11/1072/724',
            layer: ENTRY.layer,
            tile: { z: 11, x: 1072, y: 724 },
        }
        const requestedTiles = []
        let loader = null
        loader = createSwissnamesTileLoader({
            canRenderLabels: () => true,
            getEntities: () => null,
            loadFeatures: async (_layer, tile) => {
                requestedTiles.push(tile.x)
                if (tile.x === persistentEntry.tile.x) {
                    throw new Error('Persistent failure')
                }
                if (requestedTiles.filter((tileX) => tileX === ENTRY.tile.x).length === 1) {
                    throw new Error('Transient failure')
                }
                return []
            },
            requestRender: () => {},
            retry: () => loader.setVisibleEntries([ENTRY, persistentEntry]),
        })

        loader.setVisibleEntries([ENTRY, persistentEntry])
        await flushPromises()
        expect(requestedTiles).to.deep.equal([ENTRY.tile.x, persistentEntry.tile.x])

        await vi.advanceTimersByTimeAsync(500)
        expect(requestedTiles).to.deep.equal([
            ENTRY.tile.x,
            persistentEntry.tile.x,
            ENTRY.tile.x,
            persistentEntry.tile.x,
        ])

        loader.setVisibleEntries([ENTRY, persistentEntry])
        expect(requestedTiles).to.have.length(4)
        loader.clear()
    })

    it('loads an evicted tile again when it becomes visible', async () => {
        let loadCount = 0
        const loader = createSwissnamesTileLoader({
            canRenderLabels: () => true,
            getEntities: () => null,
            loadFeatures: async () => {
                loadCount += 1
                return []
            },
            requestRender: () => {},
            retry: () => {},
        })

        loader.setVisibleEntries([ENTRY])
        await flushPromises()
        expect(loadCount).to.equal(1)

        loader.setVisibleEntries([])
        loader.setVisibleEntries([ENTRY])
        await flushPromises()
        expect(loadCount).to.equal(2)

        loader.clear()
    })
})
