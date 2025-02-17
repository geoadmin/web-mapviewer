import { expect } from 'chai'
import { describe, it } from 'vitest'

import { LV95, WEBMERCATOR, WGS84 } from '@/'
import {
    removeZValues,
    toRoundedString,
    unwrapGeometryCoordinates,
    wrapXCoordinates,
} from '@/utils'

describe('Unit test functions from utils.ts', () => {
    describe('toRoundedString', () => {
        it('can handle wrong inputs', () => {
            expect(toRoundedString(null)).to.be.null
            expect(toRoundedString(undefined)).to.be.null
            expect(toRoundedString([])).to.be.null
            expect(toRoundedString(1)).to.be.null
            expect(toRoundedString('')).to.be.null
            expect(toRoundedString([null, null])).to.be.null
            expect(toRoundedString([2, null])).to.be.null
            expect(toRoundedString([2, ''])).to.be.null
            expect(toRoundedString([2, 'three'])).to.be.null
            expect(toRoundedString([2, Number.NaN])).to.be.null
            expect(toRoundedString([2, Number.POSITIVE_INFINITY])).to.be.null
        })
        it('rounds without decimal if 0 is given as digits', () => {
            expect(toRoundedString([1.49, 2.49], 0)).to.eq(
                '1, 2',
                'it should floor any number lower than .5'
            )
            expect(toRoundedString([1.5, 2.5], 0)).to.eq(
                '2, 3',
                'it should raise any number greater or equal to .5'
            )
        })
        it('rounds with decimal if a number is given as digits', () => {
            expect(toRoundedString([1.44, 2.44], 1)).to.eq('1.4, 2.4')
            expect(toRoundedString([1.45, 2.45], 1)).to.eq('1.5, 2.5')
        })
        it('correctly enforcers digits when asked for', () => {
            expect(toRoundedString([1.44, 2.44], 5, false, true)).to.eq('1.44000, 2.44000')
            expect(toRoundedString([1, 2], 3, false, true)).to.eq('1.000, 2.000')
            expect(toRoundedString([1234.5678, 1234.5678], 6, true, true)).to.eq(
                "1'234.567800, 1'234.567800"
            )
        })
    })

    describe('wrapXCoordinates()', () => {
        it('can handle wrong inputs', () => {
            expect(wrapXCoordinates(null, WGS84)).to.be.null
            expect(wrapXCoordinates(undefined, WGS84)).to.be.undefined
            expect(wrapXCoordinates([], WGS84)).to.be.an('Array').lengthOf(0)
            expect(wrapXCoordinates([1], WGS84))
                .to.be.an('Array')
                .lengthOf(1)
        })
        it('can wrap a single coordinate', () => {
            function testLowerWrap(projection) {
                expect(
                    wrapXCoordinates(
                        [projection.bounds.lowerX - 1, projection.bounds.center[1]],
                        projection
                    )
                ).to.deep.equal([projection.bounds.upperX - 1, projection.bounds.center[1]])
            }
            testLowerWrap(WGS84)
            testLowerWrap(WEBMERCATOR)

            function testUpperWrap(projection) {
                expect(
                    wrapXCoordinates(
                        [projection.bounds.upperX + 1, projection.bounds.center[1]],
                        projection
                    )
                ).to.deep.equal([projection.bounds.lowerX + 1, projection.bounds.center[1]])
            }
            testUpperWrap(WGS84)
            testUpperWrap(WEBMERCATOR)
        })
        it('do not wrap if projection is not global (world-wide)', () => {
            const justOffBoundCoordinate = [LV95.bounds.lowerX - 1, LV95.bounds.center[1]]
            expect(wrapXCoordinates(justOffBoundCoordinate, LV95)).to.deep.equal(
                justOffBoundCoordinate
            )
        })
        it('can wrap every coordinates of an array of coordinates', () => {
            function testMultipleWrap(projection) {
                const lowOutOfBoundCoordinate = [
                    projection.bounds.lowerX - 1,
                    projection.bounds.center[1],
                ]
                const inBoundCoordinate = [projection.bounds.lowerX, projection.bounds.center[1]]
                const inBoundCoordinate2 = [
                    projection.bounds.center[0],
                    projection.bounds.center[1],
                ]
                const inBoundCoordinate3 = [projection.bounds.upperX, projection.bounds.center[1]]
                const upOutOfBoundCoordinate = [
                    projection.bounds.upperX + 1,
                    projection.bounds.center[1],
                ]
                const original = [
                    lowOutOfBoundCoordinate,
                    inBoundCoordinate,
                    inBoundCoordinate2,
                    inBoundCoordinate3,
                    upOutOfBoundCoordinate,
                ]
                const result = wrapXCoordinates(original, projection)
                expect(result).to.be.an('Array').lengthOf(original.length)
                const [first, second, third, fourth, fifth] = result
                expect(first).to.deep.equal([
                    projection.bounds.upperX - 1,
                    lowOutOfBoundCoordinate[1],
                ])
                expect(second).to.deep.equal(inBoundCoordinate, 'wrong lowerX handling')
                expect(third).to.deep.equal(inBoundCoordinate2, 'wrong center handling')
                expect(fourth).to.deep.equal(inBoundCoordinate3, 'wrong upperX handling')
                expect(fifth).to.deep.equal([
                    projection.bounds.lowerX + 1,
                    upOutOfBoundCoordinate[1],
                ])
            }
            testMultipleWrap(WGS84)
            testMultipleWrap(WEBMERCATOR)
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
        it('raises an error the input if invalid', () => {
            expect(() => removeZValues(null)).to.throw(
                'Invalid coordinates received, cannot remove Z values'
            )
            expect(() => removeZValues(undefined)).to.throw(
                'Invalid coordinates received, cannot remove Z values'
            )
        })
        it('returns the input if an empty array is given', () => {
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
