import { expect } from 'chai'
import { describe, it } from 'vitest'

import { LV95, WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import {
    removeZValues,
    toLv95,
    unwrapGeometryCoordinates,
    wrapXCoordinates,
} from '@/utils/coordinates/coordinateUtils'

describe('Unit test functions from coordinateUtils.js', () => {
    describe('toLv95(coordinate, "EPSG:4326")', () => {
        it('reprojects points from EPSG:4326', () => {
            expect(LV95.isInBounds(...toLv95([6.57268, 46.51333], WGS84.epsg))).to.be.true
        })
        it('reprojects points from EPSG:3857', () => {
            expect(LV95.isInBounds(...toLv95([731667, 5862995], WEBMERCATOR.epsg))).to.be.true
        })
        it('reprojects lines', () => {
            const result = toLv95(
                [
                    [6.57268, 46.51333],
                    [6.7, 46.7],
                ],
                WGS84.epsg
            )
            expect(result).to.be.an('Array').lengthOf(2)
            result.forEach((coord) => {
                expect(LV95.isInBounds(...coord)).to.be.true
            })
        })
        it('reprojects polygons', () => {
            const result = toLv95(
                [
                    [6.57268, 46.51333],
                    [6.7, 46.7],
                    [6.9, 46.9],
                    [6.57268, 46.51333],
                ],
                WGS84.epsg
            )
            expect(result).to.be.an('Array').lengthOf(4)
            result.forEach((coord) => {
                expect(LV95.isInBounds(...coord)).to.be.true
            })
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

    describe('unwrapGeometryCoordinates(coordinates)', () => {
        it('returns the input if nothing is required', () => {
            expect(unwrapGeometryCoordinates(null)).to.be.null
            expect(unwrapGeometryCoordinates(undefined)).to.be.undefined
            expect(unwrapGeometryCoordinates([])).to.be.an('Array').lengthOf(0)
            const alreadyUnwrappedCoordinates = [
                [1, 2],
                [3, 4],
                [5, 6],
            ]
            expect(unwrapGeometryCoordinates(alreadyUnwrappedCoordinates)).to.eql(
                alreadyUnwrappedCoordinates
            )
        })
        it('unwraps when required', () => {
            const expectedOutcome = [
                [1, 2],
                [3, 4],
                [5, 6],
            ]
            const wrappedCoordinates = [expectedOutcome]
            expect(unwrapGeometryCoordinates(wrappedCoordinates)).to.eql(expectedOutcome)
        })
    })

    describe('removeZValues', () => {
        it('returns the input if invalid (no error raised)', () => {
            expect(removeZValues(null)).to.be.null
            expect(removeZValues(undefined)).to.be.undefined
            expect(removeZValues([])).to.eql([])
        })
        it('returns coordinate untouched if they have no Z values', () => {
            const coordinates = [
                [1, 2],
                [3, 4],
                [5, 6],
            ]
            expect(removeZValues(coordinates)).to.eql(coordinates)
        })
        it('removes Z values when needed', () => {
            const coordinateWithoutZValues = [
                [1, 2],
                [3, 4],
                [5, 6],
            ]
            expect(
                removeZValues(
                    coordinateWithoutZValues.map((coordinate) => [
                        coordinate[0],
                        coordinate[1],
                        Math.floor(1 + 10 * Math.random()),
                    ])
                )
            ).to.eql(coordinateWithoutZValues)
            // testing with only one coordinate
            expect(removeZValues([[1, 2, 3]])).to.eql([[1, 2]])
        })
    })
})
