import { expect } from 'chai'
import { describe, it } from 'vitest'

import {
    buildSwissnamesTileKey,
    getVisibleSwissnamesTiles,
    isSwissnamesLayerVisibleAtAltitude,
} from '@/modules/map/components/cesium/utils/swissnamesLabels'

describe('Swissnames labels helpers', () => {
    it('selects layers by min and max altitude', () => {
        const layer = { minAlt: 100, maxAlt: 500 }

        expect(isSwissnamesLayerVisibleAtAltitude(layer, 99)).to.equal(false)
        expect(isSwissnamesLayerVisibleAtAltitude(layer, 100)).to.equal(true)
        expect(isSwissnamesLayerVisibleAtAltitude(layer, 499)).to.equal(true)
        expect(isSwissnamesLayerVisibleAtAltitude(layer, 500)).to.equal(false)
    })

    it('keeps layers without an upper altitude bound visible', () => {
        const layer = { minAlt: 0, maxAlt: null }

        expect(isSwissnamesLayerVisibleAtAltitude(layer, 10000000)).to.equal(true)
    })

    it('builds deterministic tile keys', () => {
        expect(buildSwissnamesTileKey('zoomlevel4', { z: 11, x: 1071, y: 724 })).to.equal(
            'zoomlevel4/11/1071/724'
        )
    })

    it('returns visible tiles for a WGS84 rectangle and clamps oversized ranges', () => {
        const tiles = getVisibleSwissnamesTiles(
            { west: 8.4, east: 8.7, north: 47.5, south: 47.3 },
            9
        )

        expect(tiles).to.deep.equal([
            { x: 267, y: 179, z: 9 },
            { x: 268, y: 179, z: 9 },
        ])
        expect(
            getVisibleSwissnamesTiles({ west: -180, east: 180, north: 85, south: -85 }, 13, 10)
        ).to.deep.equal([])
        expect(
            getVisibleSwissnamesTiles({ west: -180, east: 180, north: 90, south: -90 }, 0)
        ).to.have.length(1)
    })
})
