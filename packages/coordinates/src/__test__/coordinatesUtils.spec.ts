import { expect } from 'chai'
import { describe, it } from 'vitest'

import type { Single3DCoordinate, SingleCoordinate } from '@/coordinatesUtils'

import coordinatesUtils from '@/coordinatesUtils'
import { CoordinateSystem, LV95, WEBMERCATOR, WGS84 } from '@/proj'

describe('Unit test for coordinatesUtils', () => {
    describe('toRoundedString', () => {
        it('rounds without decimal if 0 is given as digits', () => {
            expect(coordinatesUtils.toRoundedString([1.49, 2.49], 0)).to.eq(
                '1, 2',
                'it should floor any number lower than .5'
            )
            expect(coordinatesUtils.toRoundedString([1.5, 2.5], 0)).to.eq(
                '2, 3',
                'it should raise any number greater or equal to .5'
            )
        })
        it('rounds with decimal if a number is given as digits', () => {
            expect(coordinatesUtils.toRoundedString([1.44, 2.44], 1)).to.eq('1.4, 2.4')
            expect(coordinatesUtils.toRoundedString([1.45, 2.45], 1)).to.eq('1.5, 2.5')
        })
        it('correctly enforcers digits when asked for', () => {
            expect(coordinatesUtils.toRoundedString([1.44, 2.44], 5, false, true)).to.eq(
                '1.44000, 2.44000'
            )
            expect(coordinatesUtils.toRoundedString([1, 2], 3, false, true)).to.eq('1.000, 2.000')
            expect(coordinatesUtils.toRoundedString([1234.5678, 1234.5678], 6, true, true)).to.eq(
                "1'234.567800, 1'234.567800"
            )
        })
    })

    describe('wrapXCoordinates()', () => {
        it('can wrap a single coordinate', () => {
            function testLowerWrap(projection: CoordinateSystem): void {
                const bounds = projection.bounds
                expect(bounds).to.be.an('Object')
                expect(
                    coordinatesUtils.wrapXCoordinates(
                        [bounds!.lowerX - 1, bounds!.center[1]],
                        projection
                    )
                ).to.deep.equal([bounds!.upperX - 1, bounds!.center[1]])
            }
            testLowerWrap(WGS84)
            testLowerWrap(WEBMERCATOR)

            function testUpperWrap(projection: CoordinateSystem) {
                const bounds = projection.bounds
                expect(bounds).to.be.an('Object')
                expect(
                    coordinatesUtils.wrapXCoordinates(
                        [bounds!.upperX + 1, bounds!.center[1]],
                        projection
                    )
                ).to.deep.equal([bounds!.lowerX + 1, bounds!.center[1]])
            }
            testUpperWrap(WGS84)
            testUpperWrap(WEBMERCATOR)
        })
        it('do not wrap if projection is not global (world-wide)', () => {
            const justOffBoundCoordinate: SingleCoordinate = [
                LV95.bounds.lowerX - 1,
                LV95.bounds.center[1],
            ]
            expect(coordinatesUtils.wrapXCoordinates(justOffBoundCoordinate, LV95)).to.deep.equal(
                justOffBoundCoordinate
            )
        })
        it('can wrap every coordinates of an array of coordinates', () => {
            function testMultipleWrap(projection: CoordinateSystem) {
                const bounds = projection.bounds
                expect(bounds).to.be.an('Object')
                const lowOutOfBoundCoordinate: SingleCoordinate = [
                    bounds!.lowerX - 1,
                    bounds!.center[1],
                ]
                const inBoundCoordinate: SingleCoordinate = [bounds!.lowerX, bounds!.center[1]]
                const inBoundCoordinate2: SingleCoordinate = [bounds!.center[0], bounds!.center[1]]
                const inBoundCoordinate3: SingleCoordinate = [bounds!.upperX, bounds!.center[1]]
                const upOutOfBoundCoordinate: SingleCoordinate = [
                    bounds!.upperX + 1,
                    bounds!.center[1],
                ]
                const original = [
                    lowOutOfBoundCoordinate,
                    inBoundCoordinate,
                    inBoundCoordinate2,
                    inBoundCoordinate3,
                    upOutOfBoundCoordinate,
                ]
                const result = coordinatesUtils.wrapXCoordinates(original, projection)
                expect(result).to.be.an('Array').lengthOf(original.length)
                const [first, second, third, fourth, fifth] = result
                expect(first).to.deep.equal([bounds!.upperX - 1, lowOutOfBoundCoordinate[1]])
                expect(second).to.deep.equal(inBoundCoordinate, 'wrong lowerX handling')
                expect(third).to.deep.equal(inBoundCoordinate2, 'wrong center handling')
                expect(fourth).to.deep.equal(inBoundCoordinate3, 'wrong upperX handling')
                expect(fifth).to.deep.equal([bounds!.lowerX + 1, upOutOfBoundCoordinate[1]])
            }
            testMultipleWrap(WGS84)
            testMultipleWrap(WEBMERCATOR)
        })
    })

    describe('unwrapGeometryCoordinates(coordinates)', () => {
        it('returns the input if nothing is required', () => {
            expect(coordinatesUtils.unwrapGeometryCoordinates([])).to.be.an('Array').lengthOf(0)
            const alreadyUnwrappedCoordinates: SingleCoordinate[] = [
                [1, 2],
                [3, 4],
                [5, 6],
            ]
            expect(coordinatesUtils.unwrapGeometryCoordinates(alreadyUnwrappedCoordinates)).to.eql(
                alreadyUnwrappedCoordinates
            )
        })
        it('unwraps when required', () => {
            const expectedOutcome: SingleCoordinate[] = [
                [1, 2],
                [3, 4],
                [5, 6],
            ]
            const wrappedCoordinates = [expectedOutcome]
            expect(coordinatesUtils.unwrapGeometryCoordinates(wrappedCoordinates)).to.eql(
                expectedOutcome
            )
        })
    })

    describe('removeZValues', () => {
        it('returns the input if an empty array is given', () => {
            expect(coordinatesUtils.removeZValues([])).to.eql([])
        })
        it('returns coordinate untouched if they have no Z values', () => {
            const coordinates: SingleCoordinate[] = [
                [1, 2],
                [3, 4],
                [5, 6],
            ]
            expect(coordinatesUtils.removeZValues(coordinates)).to.eql(coordinates)
        })
        it('removes Z values when needed', () => {
            const coordinateWithoutZValues: SingleCoordinate[] = [
                [1, 2],
                [3, 4],
                [5, 6],
            ]
            expect(
                coordinatesUtils.removeZValues(
                    coordinateWithoutZValues.map(
                        (coordinate): Single3DCoordinate => [
                            coordinate[0],
                            coordinate[1],
                            Math.floor(1 + 10 * Math.random()),
                        ]
                    )
                )
            ).to.eql(coordinateWithoutZValues)
            // testing with only one coordinate
            expect(coordinatesUtils.removeZValues([[1, 2, 3]])).to.eql([[1, 2]])
        })
    })
})
