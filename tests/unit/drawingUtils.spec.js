import { expect } from 'chai'
import {
    formatPointCoordinates,
    formatMeters,
    lonLatToLv95,
} from '@/modules/drawing/lib/drawingUtils'
import setupProj4 from '@/utils/setupProj4'

// setting up projection for proj4 otherwise they will fail when asked
setupProj4()

describe('Unit test functions from drawingUtils.js', () => {
    describe('wgs84ToLv95(coordinate)', () => {
        it('reprojects points', () => {
            expect(lonLatToLv95([46.51333, 6.57268].reverse())).to.eql([
                2533541.8057776038,
                1151703.909974419,
            ])
        })
        it('reprojects lines', () => {
            expect(lonLatToLv95([[46.51333, 6.57268].reverse(), [46.7, 6.7].reverse()])).to.eql([
                [2533541.8057776038, 1151703.909974419],
                [2543508.4227881124, 1172354.2517551924],
            ])
        })
        it('reprojects polygons', () => {
            expect(
                lonLatToLv95([
                    [46.51333, 6.57268].reverse(),
                    [46.7, 6.7].reverse(),
                    [46.9, 6.9].reverse(),
                    [46.51333, 6.57268].reverse(),
                ])
            ).to.eql([
                [2533541.8057776038, 1151703.909974419],
                [2543508.4227881124, 1172354.2517551924],
                [2558957.32134749, 1194462.5957064652],
                [2533541.8057776038, 1151703.909974419],
            ])
        })
    })

    describe('formatMeters()', () => {
        it('format meters', () => {
            expect(formatMeters(42)).to.equal('42 m')
            expect(formatMeters(4002)).to.equal('4 km')
            expect(formatMeters(4200)).to.equal('4.2 km')
            expect(formatMeters(4200000)).to.equal('4’200 km')
        })
        it('format squared meters', () => {
            expect(formatMeters(42, { dim: 2 })).to.equal('42 m²')
            expect(formatMeters(4002, { dim: 2 })).to.equal('4’002 m²')
            expect(formatMeters(4200, { dim: 2 })).to.equal('4’200 m²')
            expect(formatMeters(4200000, { dim: 2 })).to.equal('4.2 km²')
            expect(formatMeters(4200000000, { dim: 2 })).to.equal('4’200 km²')
        })
    })

    describe('formatPointCoordinates()', () => {
        it('format coordaintes', () => {
            expect(formatPointCoordinates([2533541.8057776038, 1151703.909974419])).to.eql(
                '2’533’542, 1’151’704'
            )
        })
    })
})
