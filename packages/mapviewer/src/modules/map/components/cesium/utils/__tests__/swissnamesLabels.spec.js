import { expect } from 'chai'
import { describe, it } from 'vitest'

import {
    buildSwissnamesTileKey,
    buildSwissnamesTileUrl,
    extractSwissnamesFeatureProperties,
    getSwissnamesTileBounds,
    getVisibleSwissnamesTiles,
    isSwissnamesLayerVisibleAtAltitude,
    mvtPointToWgs84,
} from '@/modules/map/components/cesium/utils/swissnamesLabels'

describe('Swissnames labels helpers', () => {
    it('builds tile URLs without duplicating slashes', () => {
        expect(
            buildSwissnamesTileUrl(
                'https://sys-3d.dev.bgdi.ch/ch.swisstopo.swissnames3d.3d/v1/',
                '/20260320',
                'zoomlevel4',
                { z: 11, x: 1071, y: 724 }
            )
        ).to.equal(
            'https://sys-3d.dev.bgdi.ch/ch.swisstopo.swissnames3d.3d/v1/20260320/zoomlevel4/11/1071/724.pbf'
        )
    })

    it('selects layers by min and max altitude', () => {
        const layer = { minAlt: 100, maxAlt: 500 }

        expect(isSwissnamesLayerVisibleAtAltitude(layer, 99)).to.equal(false)
        expect(isSwissnamesLayerVisibleAtAltitude(layer, 100)).to.equal(true)
        expect(isSwissnamesLayerVisibleAtAltitude(layer, 499)).to.equal(true)
        expect(isSwissnamesLayerVisibleAtAltitude(layer, 500)).to.equal(false)
    })

    it('builds deterministic tile keys', () => {
        expect(buildSwissnamesTileKey('zoomlevel4', { z: 11, x: 1071, y: 724 })).to.equal(
            'zoomlevel4/11/1071/724'
        )
    })

    it('computes slippy tile bounds and converts MVT points to WGS84', () => {
        const bounds = getSwissnamesTileBounds({ z: 1, x: 1, y: 1 })
        const center = mvtPointToWgs84({ x: 2048, y: 2048 }, 4096, bounds)

        expect(bounds.west).to.equal(0)
        expect(bounds.east).to.equal(180)
        expect(center.lon).to.be.approximately(90, 0.000001)
        expect(center.lat).to.be.approximately(-66.51326, 0.00001)
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

    it('rejects malformed MVT point conversion input with clear errors', () => {
        const bounds = getSwissnamesTileBounds({ z: 1, x: 1, y: 1 })

        expect(() => mvtPointToWgs84(null, 4096, bounds)).to.throw(
            TypeError,
            'Invalid Swissnames label point'
        )
        expect(() => mvtPointToWgs84({ x: 1, y: 1 }, 0, bounds)).to.throw(
            TypeError,
            'Invalid Swissnames label extent'
        )
        expect(() => mvtPointToWgs84({ x: 1, y: 1 }, 4096, null)).to.throw(
            TypeError,
            'Invalid Swissnames label tileBounds'
        )
    })

    it('extracts label text and type across known casing variants', () => {
        expect(extractSwissnamesFeatureProperties({ Name: 'Zürich', TYPE: 'ORT' })).to.deep.equal({
            text: 'Zürich',
            type: 'ORT',
        })
        expect(
            extractSwissnamesFeatureProperties({ label: 'Fallback', Type: 'SEE' })
        ).to.deep.equal({
            text: 'Fallback',
            type: 'SEE',
        })
        expect(
            extractSwissnamesFeatureProperties({
                name: '',
                Name: 'Fallback name',
                type: '',
                TYPE: 'ORT',
            })
        ).to.deep.equal({
            text: 'Fallback name',
            type: 'ORT',
        })
        expect(extractSwissnamesFeatureProperties({})).to.deep.equal({ text: '', type: '' })
        expect(extractSwissnamesFeatureProperties(null)).to.deep.equal({ text: '', type: '' })
    })
})
