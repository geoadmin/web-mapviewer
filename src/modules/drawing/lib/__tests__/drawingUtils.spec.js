import {
    formatMeters,
    formatPointCoordinates,
    formatTime,
    toLv95,
    wrapXCoordinates,
} from '@/modules/drawing/lib/drawingUtils'
import { WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import setupProj4 from '@/utils/setupProj4'
import { expect } from 'chai'
import { describe, it } from 'vitest'

// setting up projection for proj4 otherwise they will fail when asked
setupProj4()

describe('Unit test functions from drawingUtils.js', () => {
    describe('toLv95(coordinate, "EPSG:4326")', () => {
        it('reprojects points from EPSG:4326', () => {
            expect(toLv95([6.57268, 46.51333], WGS84.epsg)).to.eql([
                2533541.8057776038, 1151703.909974419,
            ])
        })
        it('reprojects points from EPSG:3857', () => {
            expect(toLv95([731667, 5862995], WEBMERCATOR.epsg)).to.eql([
                2533541.530335663, 1151703.3642947723,
            ])
        })
        it('reprojects lines', () => {
            expect(
                toLv95(
                    [
                        [6.57268, 46.51333],
                        [6.7, 46.7],
                    ],
                    WGS84.epsg
                )
            ).to.eql([
                [2533541.8057776038, 1151703.909974419],
                [2543508.4227881124, 1172354.2517551924],
            ])
        })
        it('reprojects polygons', () => {
            expect(
                toLv95(
                    [
                        [6.57268, 46.51333],
                        [6.7, 46.7],
                        [6.9, 46.9],
                        [6.57268, 46.51333],
                    ],
                    WGS84.epsg
                )
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
            expect(formatMeters(4200000)).to.equal("4'200 km")
        })
        it('format squared meters', () => {
            expect(formatMeters(42, { dim: 2 })).to.equal('42 m²')
            expect(formatMeters(4002, { dim: 2 })).to.equal("4'002 m²")
            expect(formatMeters(4200, { dim: 2 })).to.equal("4'200 m²")
            expect(formatMeters(4200000, { dim: 2 })).to.equal('4.2 km²')
            expect(formatMeters(4200000000, { dim: 2 })).to.equal("4'200 km²")
        })
    })

    describe('formatPointCoordinates()', () => {
        it('format coordinates', () => {
            expect(formatPointCoordinates([2533541.8057776038, 1151703.909974419])).to.eql(
                "2'533'542, 1'151'704"
            )
        })
    })

    describe('formatTime()', () => {
        it('format time', () => {
            expect(formatTime(null)).to.equal('-')
            expect(formatTime(42)).to.equal('42min')
            expect(formatTime(1200)).to.equal('20h')
            expect(formatTime(1230)).to.equal('20h 30min')
            expect(formatTime(1202)).to.equal('20h 2min')
        })
    })

    describe('wrapXCoordinates()', () => {
        it('Wrap in place', () => {
            const original = [
                [300, 300],
                [360, 360],
            ]
            const ref2Original = wrapXCoordinates(original, WGS84, true)
            expect(ref2Original).to.deep.equal([
                [-60, 300],
                [0, 360],
            ])
            expect(ref2Original).to.deep.equal(original)
        })
        it('Wrap not in place', () => {
            const original = [
                [300, 300],
                [360, 360],
            ]
            const ref2Original = wrapXCoordinates(original, WGS84, false)
            expect(ref2Original).to.deep.equal([
                [-60, 300],
                [0, 360],
            ])
            expect(ref2Original).to.not.deep.equal(original)
            expect(original).to.deep.equal([
                [300, 300],
                [360, 360],
            ])
        })
    })
})
