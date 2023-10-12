import CoordinateSystemBounds from '@/utils/coordinates/CoordinateSystemBounds.class'
import { expect } from 'chai'
import { beforeEach, describe, it } from 'vitest'

describe('CoordinateSystemBounds', () => {
    describe('splitIfOutOfBounds(coordinates, bounds)', () => {
        let bounds

        beforeEach(() => {
            bounds = new CoordinateSystemBounds(0, 100, 50, 100)
        })

        it('returns null if invalid/malformed coordinates are given', () => {
            expect(bounds.splitIfOutOfBounds(null)).to.be.null
            expect(bounds.splitIfOutOfBounds(1)).to.be.null
            expect(bounds.splitIfOutOfBounds('test')).to.be.null
            expect(bounds.splitIfOutOfBounds([1, 2])).to.be.null
            expect(bounds.splitIfOutOfBounds([[3]])).to.be.null
            expect(bounds.splitIfOutOfBounds([[1, 2, 3]])).to.be.null
        })
        it('returns a single CoordinatesChunk if no split is needed', () => {
            const coordinatesWithinBounds = [
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
            const [singleChunk] = result
            expect(singleChunk).to.be.an('Object').that.hasOwnProperty('coordinates')
            expect(singleChunk).to.haveOwnProperty('isWithinBounds')
            expect(singleChunk.isWithinBounds).to.be.true
            expect(singleChunk.coordinates).to.eql(coordinatesWithinBounds)
        })
        it('splits the given coordinates in two chunks if part of it is outside bounds', () => {
            const yValue = 50
            const coordinatesOverlappingBounds = [
                // starting by adding coordinates out of bounds
                [bounds.lowerX - 1, yValue],
                // split should occur here as we start to be in bounds
                [bounds.lowerX + 1, yValue],
                [50, yValue],
                [bounds.upperX - 1, yValue],
            ]
            const result = bounds.splitIfOutOfBounds(coordinatesOverlappingBounds)
            expect(result).to.be.an('Array').of.length(2)
            const [outOfBoundChunk, inBoundChunk] = result
            expect(outOfBoundChunk).to.haveOwnProperty('isWithinBounds')
            expect(outOfBoundChunk.isWithinBounds).to.be.false
            expect(outOfBoundChunk.coordinates).to.be.an('Array').of.length(2)
            expect(outOfBoundChunk.coordinates[0]).to.eql(coordinatesOverlappingBounds[0])
            // checking that the split happened on the bounds
            const intersectingCoordinate = outOfBoundChunk.coordinates[1]
            expect(intersectingCoordinate).to.be.an('Array').of.length(2)
            expect(intersectingCoordinate).to.eql([bounds.lowerX - 1, yValue])
            // next chunk must start by the intersecting coordinate
            expect(inBoundChunk).to.haveOwnProperty('isWithinBounds')
            expect(inBoundChunk.isWithinBounds).to.be.true
            expect(inBoundChunk.coordinates).to.be.an('Array').of.length(4)
            const [firstInBoundCoordinate] = inBoundChunk.coordinates
            expect(firstInBoundCoordinate).to.be.an('Array').of.length(2)
            expect(firstInBoundCoordinate).to.eql([bounds.lowerX - 1, yValue])
            // checking that further coordinates have been correctly copied
            coordinatesOverlappingBounds.slice(1).forEach((coordinate, index) => {
                expect(inBoundChunk.coordinates[index + 1][0]).to.eq(coordinate[0])
                expect(inBoundChunk.coordinates[index + 1][1]).to.eq(coordinate[1])
            })
        })
        it('handles properly a line going multiple times out of bounds', () => {
            const coordinatesGoingBackAndForth = [
                [-1, 51], // outside
                [1, 51], // inside going in the X direction
                [1, 101], // outside going in the Y direction
                [101, 101], // outside
                [99, 99], // inside going both directions
                [1, 51], // inside moving on the other side of the bounds
            ]
            const expectedFirstIntersection = [bounds.lowerX, 51]
            const expectedSecondIntersection = [1, bounds.upperY]
            const expectedThirdIntersection = [bounds.upperX, bounds.upperY]

            const result = bounds.splitIfOutOfBounds(coordinatesGoingBackAndForth)
            expect(result).to.be.an('Array').of.length(4)
            const [firstChunk, secondChunk, thirdChunk, fourthChunk] = result
            // first chunk should have two coordinates, the first from the list and the first intersection
            expect(firstChunk.coordinates).to.be.an('Array').of.length(2)
            expect(firstChunk.coordinates[0]).to.eql(coordinatesGoingBackAndForth[0])
            expect(firstChunk.coordinates[1]).to.eql(expectedFirstIntersection)
            // second chunk should start with the first intersection, then include the second coord
            // and finish with the second intersection
            expect(secondChunk.coordinates).to.be.an('Array').of.length(3)
            expect(secondChunk.coordinates[0]).to.eql(expectedFirstIntersection)
            expect(secondChunk.coordinates[1]).to.eql(coordinatesGoingBackAndForth[1])
            expect(secondChunk.coordinates[2]).to.eql(expectedSecondIntersection)
            // third chunk should be : intersection2, coord3, coord4, intersection3
            expect(thirdChunk.coordinates).to.be.an('Array').of.length(4)
            expect(thirdChunk.coordinates[0]).to.eql(expectedSecondIntersection)
            expect(thirdChunk.coordinates[1]).to.eql(coordinatesGoingBackAndForth[2])
            expect(thirdChunk.coordinates[2]).to.eql(coordinatesGoingBackAndForth[3])
            expect(thirdChunk.coordinates[3]).to.eql(expectedThirdIntersection)
            // last chunk should be : intersection3, coord5, coord6
            expect(fourthChunk.coordinates).to.be.an('Array').of.length(3)
            expect(fourthChunk.coordinates[0]).to.eql(expectedThirdIntersection)
            expect(fourthChunk.coordinates[1]).to.eql(coordinatesGoingBackAndForth[4])
            expect(fourthChunk.coordinates[2]).to.eql(coordinatesGoingBackAndForth[5])
        })
    })
    describe('isInBounds(x, y)', () => {
        const testInstance = new CoordinateSystemBounds(-1, 1, -1, 1)
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
    describe('flatten()', () => {
        const lowX = 123
        const highX = 456
        const lowY = 345
        const highY = 678
        const testInstance = new CoordinateSystemBounds(lowX, highX, lowY, highY)
        it('produces a flatten array correctly', () => {
            expect(testInstance.flatten()).to.eql([lowX, lowY, highX, highY])
        })
    })
})
