import { expect } from 'chai'
import { describe, it } from 'vitest'

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

describe('Swissnames tile loader', () => {
    it('cancels an invisible request without blacklisting a later reload', async () => {
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
    })
})
