import { expect } from 'chai'
import { beforeEach, describe, it } from 'vitest'

import type { SingleCoordinate } from '@/coordinatesUtils'

import { LV95 } from '@/proj'
import CoordinateSystemBounds from '@/proj/CoordinateSystemBounds'

describe('CoordinateSystemBounds', () => {
    describe('splitIfOutOfBounds(coordinates, bounds)', () => {
        let bounds: CoordinateSystemBounds

        beforeEach(() => {
            bounds = new CoordinateSystemBounds({ lowerX: 0, upperX: 100, lowerY: 50, upperY: 100 })
        })

        it('returns a single CoordinatesChunk if no split is needed', () => {
            const coordinatesWithinBounds: SingleCoordinate[] = [
                [bounds.lowerX + 1, bounds.upperY - 1],
                [bounds.lowerX + 2, bounds.upperY - 2],
                [bounds.lowerX + 3, bounds.upperY - 3],
                [bounds.lowerX + 4, bounds.upperY - 4],
                [bounds.lowerX + 5, bounds.upperY - 5],
                [bounds.lowerX + 6, bounds.upperY - 6],
                [bounds.lowerX + 7, bounds.upperY - 7],
            ]
            const result = bounds.splitIfOutOfBounds(coordinatesWithinBounds)
            expect(result).to.be.an('Array').of.length(1)
            const [singleChunk] = result!
            expect(singleChunk).to.be.an('Object').that.has.ownProperty('coordinates')
            expect(singleChunk).to.haveOwnProperty('isWithinBounds')
            expect(singleChunk!.isWithinBounds).to.be.true
            expect(singleChunk!.coordinates).to.eql(coordinatesWithinBounds)
        })
        it('splits the given coordinates in two chunks if part of it is outside bounds', () => {
            const yValue = 50
            const coordinatesOverlappingBounds: SingleCoordinate[] = [
                // starting by adding coordinates out of bounds
                [bounds.lowerX - 1, yValue],
                // split should occur here as we start to be in bounds
                [bounds.lowerX + 1, yValue],
                [50, yValue],
                [bounds.upperX - 1, yValue],
            ]
            const result = bounds.splitIfOutOfBounds(coordinatesOverlappingBounds)
            expect(result).to.be.an('Array').of.length(2)
            const [outOfBoundChunk, inBoundChunk] = result!
            expect(outOfBoundChunk).to.haveOwnProperty('isWithinBounds')
            expect(outOfBoundChunk!.isWithinBounds).to.be.false
            expect(outOfBoundChunk!.coordinates).to.be.an('Array').of.length(2)
            expect(outOfBoundChunk!.coordinates[0]).to.eql(coordinatesOverlappingBounds[0])
            // checking that the split happened on the bounds
            const intersectingCoordinate = outOfBoundChunk!.coordinates[1]
            expect(intersectingCoordinate).to.be.an('Array').of.length(2)
            expect(intersectingCoordinate).to.eql([bounds.lowerX, yValue])
            // next chunk must start by the intersecting coordinate
            expect(inBoundChunk).to.haveOwnProperty('isWithinBounds')
            expect(inBoundChunk!.isWithinBounds).to.be.true
            expect(inBoundChunk!.coordinates).to.be.an('Array').of.length(4)
            const [firstInBoundCoordinate] = inBoundChunk!.coordinates
            expect(firstInBoundCoordinate).to.be.an('Array').of.length(2)
            expect(firstInBoundCoordinate).to.eql([bounds.lowerX, yValue])
            // checking that further coordinates have been correctly copied
            coordinatesOverlappingBounds.slice(1).forEach((coordinate, index) => {
                expect(inBoundChunk!.coordinates[index + 1]![0]).to.eq(coordinate[0])
                expect(inBoundChunk!.coordinates[index + 1]![1]).to.eq(coordinate[1])
            })
        })
        it('gives similar results if coordinates are given in the reverse order', () => {
            const yValue = 50
            // same test data as previous test, but reversed
            const coordinatesOverlappingBounds: SingleCoordinate[] = [
                [bounds.lowerX - 1, yValue] as SingleCoordinate,
                [bounds.lowerX + 1, yValue] as SingleCoordinate,
                [50, yValue] as SingleCoordinate,
                [bounds.upperX - 1, yValue] as SingleCoordinate,
            ].toReversed()
            const result = bounds.splitIfOutOfBounds(coordinatesOverlappingBounds)
            expect(result).to.be.an('Array').of.length(2)
            const [inBoundChunk, outOfBoundChunk] = result!

            // first chunk must now be the in bound one
            expect(inBoundChunk).to.haveOwnProperty('isWithinBounds')
            expect(inBoundChunk!.isWithinBounds).to.be.true
            expect(inBoundChunk!.coordinates).to.be.an('Array').of.length(4)
            const lastInBoundCoordinate = inBoundChunk!.coordinates.splice(-1)[0]
            expect(lastInBoundCoordinate).to.be.an('Array').of.length(2)
            expect(lastInBoundCoordinate).to.eql([bounds.lowerX, yValue])

            expect(outOfBoundChunk).to.haveOwnProperty('isWithinBounds')
            expect(outOfBoundChunk!.isWithinBounds).to.be.false
            expect(outOfBoundChunk!.coordinates).to.be.an('Array').of.length(2)
            expect(outOfBoundChunk!.coordinates[0]).to.eql([bounds.lowerX, yValue])
        })
        it('handles properly a line going multiple times out of bounds', () => {
            const coordinatesGoingBackAndForth: SingleCoordinate[] = [
                [-1, 51], // outside
                [1, 51], // inside going in the X direction
                [1, 101], // outside going in the Y direction
                [101, 101], // outside
                [99, 99], // inside going both directions
                [1, 51], // inside moving on the other side of the bounds
            ]
            const expectedFirstIntersection: SingleCoordinate = [bounds.lowerX, 51]
            const expectedSecondIntersection: SingleCoordinate = [1, bounds.upperY]
            const expectedThirdIntersection: SingleCoordinate = [bounds.upperX, bounds.upperY]

            const result = bounds.splitIfOutOfBounds(coordinatesGoingBackAndForth)
            expect(result).to.be.an('Array').of.length(4)
            const [firstChunk, secondChunk, thirdChunk, fourthChunk] = result!
            // first chunk should have two coordinates, the first from the list and the first intersection
            expect(firstChunk!.isWithinBounds).to.be.false
            expect(firstChunk!.coordinates).to.be.an('Array').of.length(2)
            expect(firstChunk!.coordinates[0]).to.eql(coordinatesGoingBackAndForth[0])
            expect(firstChunk!.coordinates[1]).to.eql(expectedFirstIntersection)
            // second chunk should start with the first intersection, then include the second coord
            // and finish with the second intersection
            expect(secondChunk!.coordinates).to.be.an('Array').of.length(3)
            expect(secondChunk!.isWithinBounds).to.be.true
            expect(secondChunk!.coordinates[0]).to.eql(expectedFirstIntersection)
            expect(secondChunk!.coordinates[1]).to.eql(coordinatesGoingBackAndForth[1])
            expect(secondChunk!.coordinates[2]).to.eql(expectedSecondIntersection)
            // third chunk should be : intersection2, coord3, coord4, intersection3
            expect(thirdChunk!.coordinates).to.be.an('Array').of.length(4)
            expect(thirdChunk!.isWithinBounds).to.be.false
            expect(thirdChunk!.coordinates[0]).to.eql(expectedSecondIntersection)
            expect(thirdChunk!.coordinates[1]).to.eql(coordinatesGoingBackAndForth[2])
            expect(thirdChunk!.coordinates[2]).to.eql(coordinatesGoingBackAndForth[3])
            expect(thirdChunk!.coordinates[3]).to.eql(expectedThirdIntersection)
            // last chunk should be : intersection3, coord5, coord6
            expect(fourthChunk!.coordinates).to.be.an('Array').of.length(3)
            expect(fourthChunk!.isWithinBounds).to.be.true
            expect(fourthChunk!.coordinates[0]).to.eql(expectedThirdIntersection)
            expect(fourthChunk!.coordinates[1]).to.eql(coordinatesGoingBackAndForth[4])
            expect(fourthChunk!.coordinates[2]).to.eql(coordinatesGoingBackAndForth[5])
        })
        it('splits correctly a line crossing bounds two times in a straight line (no stop inside)', () => {
            const coordinatesGoingThrough: SingleCoordinate[] = [
                [-1, 50], // outside
                [101, 50], // outside
            ]
            const expectedFirstIntersection: SingleCoordinate = [bounds.lowerX, 50]
            const expectedSecondIntersection: SingleCoordinate = [bounds.upperX, 50]

            const result = bounds.splitIfOutOfBounds(coordinatesGoingThrough)
            expect(result).to.be.an('Array').of.length(3)
            const [firstChunk, secondChunk, thirdChunk] = result!

            expect(firstChunk!.isWithinBounds).to.be.false
            expect(firstChunk!.coordinates).to.be.an('Array').of.length(2)
            expect(firstChunk!.coordinates[0]).to.eql(coordinatesGoingThrough[0])
            expect(firstChunk!.coordinates[1]).to.eql(expectedFirstIntersection)

            expect(secondChunk!.isWithinBounds).to.be.true
            expect(secondChunk!.coordinates).to.be.an('Array').of.length(2)
            expect(secondChunk!.coordinates[0]).to.eql(expectedFirstIntersection)
            expect(secondChunk!.coordinates[1]).to.eql(expectedSecondIntersection)

            expect(thirdChunk!.isWithinBounds).to.be.false
            expect(thirdChunk!.coordinates).to.be.an('Array').of.length(2)
            expect(thirdChunk!.coordinates[0]).to.eql(expectedSecondIntersection)
            expect(thirdChunk!.coordinates[1]).to.eql(coordinatesGoingThrough[1])
        })
        it('handles some "real" use case well', () => {
            const sample1: SingleCoordinate[] = [
                [2651000, 1392000],
                [2932500, 894500],
            ]
            const result = LV95.bounds.splitIfOutOfBounds(sample1)
            expect(result).to.be.an('Array').of.length(3)
            const [firstChunk, secondChunk, thirdChunk] = result!

            expect(firstChunk!.isWithinBounds).to.be.false
            expect(firstChunk!.coordinates).to.be.an('Array').of.length(2)
            expect(firstChunk!.coordinates[0]).to.eql(sample1[0])
            expect(firstChunk!.coordinates[1]![0]).to.approximately(2674764.8, 0.1)
            expect(firstChunk!.coordinates[1]![1]).to.approximately(1350000, 0.1)

            expect(secondChunk!.isWithinBounds).to.be.true
            expect(secondChunk!.coordinates).to.be.an('Array').of.length(2)
            expect(secondChunk!.coordinates[0]![0]).to.approximately(2674764.8, 0.1)
            expect(secondChunk!.coordinates[0]![1]).to.approximately(1350000, 0.1)
            expect(secondChunk!.coordinates[1]![0]).to.approximately(2855830.1, 0.1)
            expect(secondChunk!.coordinates[1]![1]).to.approximately(1030000, 0.1)

            expect(thirdChunk!.isWithinBounds).to.be.false
            expect(thirdChunk!.coordinates).to.be.an('Array').of.length(2)
            expect(thirdChunk!.coordinates[0]![0]).to.approximately(2855830.1, 0.1)
            expect(thirdChunk!.coordinates[0]![1]).to.approximately(1030000, 0.1)
            expect(thirdChunk!.coordinates[1]).to.eql(sample1[1])

            const reversedResult = LV95.bounds.splitIfOutOfBounds(sample1.toReversed())
            expect(reversedResult).to.be.an('Array').of.length(3)
            const [firstReversedChunk, secondReversedChunk, thirdReversedChunk] = reversedResult!

            expect(firstReversedChunk!.isWithinBounds).to.be.false
            expect(firstReversedChunk!.coordinates).to.be.an('Array').of.length(2)
            expect(firstReversedChunk!.coordinates[0]).to.eql(sample1[1])
            expect(firstReversedChunk!.coordinates[1]![0]).to.approximately(2855830.1, 0.1)
            expect(firstReversedChunk!.coordinates[1]![1]).to.approximately(1030000, 0.1)

            expect(secondReversedChunk!.isWithinBounds).to.be.true
            expect(secondReversedChunk!.coordinates).to.be.an('Array').of.length(2)
            expect(secondReversedChunk!.coordinates[0]![0]).to.approximately(2855830.1, 0.1)
            expect(secondReversedChunk!.coordinates[0]![1]).to.approximately(1030000, 0.1)
            expect(secondReversedChunk!.coordinates[1]![0]).to.approximately(2674764.8, 0.1)
            expect(secondReversedChunk!.coordinates[1]![1]).to.approximately(1350000, 0.1)

            expect(thirdReversedChunk!.isWithinBounds).to.be.false
            expect(thirdReversedChunk!.coordinates).to.be.an('Array').of.length(2)
            expect(thirdReversedChunk!.coordinates[0]![0]).to.approximately(2674764.8, 0.1)
            expect(thirdReversedChunk!.coordinates[0]![1]).to.approximately(1350000, 0.1)
            expect(thirdReversedChunk!.coordinates[1]).to.eql(sample1[0])
        })
    })
    describe('isInBounds(x, y)', () => {
        const testInstance = new CoordinateSystemBounds({
            lowerX: -1,
            upperX: 1,
            lowerY: -1,
            upperY: 1,
        })
        it('returns true if we are on the border of the bounds', () => {
            expect(testInstance.isInBounds(-1, -1)).to.be.true
            expect(testInstance.isInBounds(-1, 1)).to.be.true
            expect(testInstance.isInBounds(1, -1)).to.be.true
            expect(testInstance.isInBounds(1, 1)).to.be.true
        })
        it('returns true if we are in bounds not touching any border', () => {
            expect(testInstance.isInBounds(0, 0)).to.be.true
        })
        it('returns false if only one parameter (X or Y) is out of bound', () => {
            expect(testInstance.isInBounds(-1, -2)).to.be.false
            expect(testInstance.isInBounds(-2, -1)).to.be.false
            expect(testInstance.isInBounds(-1, 2)).to.be.false
            expect(testInstance.isInBounds(2, -1)).to.be.false
            expect(testInstance.isInBounds(1, -2)).to.be.false
            expect(testInstance.isInBounds(-2, 1)).to.be.false
            expect(testInstance.isInBounds(1, 2)).to.be.false
            expect(testInstance.isInBounds(2, 1)).to.be.false
        })
    })
    describe('flatten', () => {
        const lowerX = 123
        const upperX = 456
        const lowerY = 345
        const upperY = 678
        const testInstance = new CoordinateSystemBounds({ lowerX, upperX, lowerY, upperY })
        it('produces a flatten array correctly', () => {
            expect(testInstance.flatten).to.eql([lowerX, lowerY, upperX, upperY])
        })
    })
})
