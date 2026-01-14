import type { CoordinatesChunk, SingleCoordinate } from '@swissgeo/coordinates'

import { describe, expect, it } from 'vitest'

import type { ElevationProfileMetadata, ElevationProfilePoint } from '@/types/profile'

import profileUtils from '@/utils/profileUtils'

const testPoints: ElevationProfilePoint[] = [
    { coordinate: [0, 0], dist: 0, elevation: 100, hasElevationData: true },
    { coordinate: [0, 50], dist: 50, elevation: 210, hasElevationData: true },
    { coordinate: [0, 150], dist: 150, elevation: 90, hasElevationData: true },
    { coordinate: [50, 150], dist: 200, elevation: 200, hasElevationData: true },
]

describe('Profile calculation => getProfileMetadata(points)', () => {
    it('returns 0 for all multi-points calculation if there is less than two points', () => {
        const result: ElevationProfileMetadata = profileUtils.getProfileMetadata([
            { coordinate: [1, 1], dist: 1, hasElevationData: false },
        ])
        expect(result.hasElevationData).to.be.false
        expect(result.hasDistanceData).to.be.true
        expect(result.totalLinearDist).to.eq(1) // dist is a unique point calculation, it should be there
        expect(result.elevationDifference).to.eq(0)
        expect(result.totalAscent).to.eq(0)
        expect(result.totalDescent).to.eq(0)
        expect(result.hikingTime).to.eq(0)
    })
    it('tells it has elevation data if the only parts of the points contains elevation', () => {
        const result: ElevationProfileMetadata = profileUtils.getProfileMetadata([
            { coordinate: [1, 1], dist: 0, hasElevationData: false },
            { coordinate: [2, 1], dist: 1, elevation: 1, hasElevationData: true },
        ])
        expect(result.hasElevationData).to.be.true
        expect(result.hasDistanceData).to.be.true
    })
    it('gives the correct max/min distance and elevations', () => {
        const result: ElevationProfileMetadata = profileUtils.getProfileMetadata(testPoints)
        expect(result.totalLinearDist).to.eq(200)
        expect(result.maxElevation).to.eq(210)
        expect(result.minElevation).to.eq(90)
    })
    it('calculates elevation difference correctly', () => {
        const result: ElevationProfileMetadata = profileUtils.getProfileMetadata(testPoints)
        // comparing start and finish, so 200 - 100
        expect(result.elevationDifference).to.eq(100)
    })
    it('calculates total ascent correctly', () => {
        const result: ElevationProfileMetadata = profileUtils.getProfileMetadata(testPoints)
        // from point 1 to 2 : 110
        // from point 3 to 4 : 110
        // total: 220
        expect(result.totalAscent).to.eq(220)
    })
    it('calculates total descent correctly', () => {
        const result: ElevationProfileMetadata = profileUtils.getProfileMetadata(testPoints)
        // from 210 to 90, so -120, but it's in absolute form
        expect(result.totalDescent).to.eq(120)
    })
    it('calculates slope distance correctly', () => {
        const result: ElevationProfileMetadata = profileUtils.getProfileMetadata(testPoints)
        // here we calculate with Pythagoras between each point
        // so that we take into account the difference of altitude/elevation
        // between 1 and 2 : 50m of distance and 110m of elevation, so sqrt(50^2 + 110^2) ~= 120.83m
        // between 2 and 3 : 100m of distance and -120m of elevation, so sqrt(100^2 + -120^2) ~= 156.20m
        // between 3 and 4 : 50m of distance and 110m of elevation, so sqrt(50^2 + 110^2) ~= 120.83m
        // total : 397.86m
        expect(result.slopeDistance).to.approximately(397.86, 0.01)
    })
})
describe('formatMinutesTime()', () => {
    it('format time', () => {
        expect(profileUtils.formatMinutesTime()).to.equal('-')
        expect(profileUtils.formatMinutesTime(42)).to.equal('42min')
        expect(profileUtils.formatMinutesTime(1200)).to.equal('20h')
        expect(profileUtils.formatMinutesTime(1230)).to.equal('20h 30min')
        expect(profileUtils.formatMinutesTime(1202)).to.equal('20h 2min')
    })
})

describe('splitIfTooManyPoints', () => {
    /**
     * @param pointsCount Number of points to generate
     * @returns A CoordinatesChunk with the specified number of points
     */
    function generateChunkWith(pointsCount: number): CoordinatesChunk {
        const coordinates: SingleCoordinate[] = []
        for (let i = 0; i < pointsCount; i++) {
            coordinates.push([0, i])
        }
        return {
            coordinates,
            isWithinBounds: true,
        }
    }

    it('does not split a segment that does not contain more point than the limit', () => {
        const result = profileUtils.splitIfTooManyPoints(generateChunkWith(3000))
        expect(result).to.be.an('Array').lengthOf(1)
        expect(result).to.not.be.undefined
        if (result && result.length > 0) {
            expect(result[0]!.coordinates).to.be.an('Array').lengthOf(3000)
        }
    })
    it('splits if one coordinates above the limit', () => {
        const result = profileUtils.splitIfTooManyPoints(generateChunkWith(3001))
        expect(result).to.be.an('Array').lengthOf(2)
        expect(result).to.not.be.undefined
        if (result && result.length > 1) {
            expect(result[0]!.coordinates).to.be.an('Array').lengthOf(3000)
            expect(result[1]!.coordinates).to.be.an('Array').lengthOf(1)
        }
    })
    it('creates as many sub-chunks as necessary', () => {
        const result = profileUtils.splitIfTooManyPoints(generateChunkWith(3000 * 4 + 123))
        expect(result).to.be.an('Array').lengthOf(5)
        expect(result).to.not.be.undefined
        if (result && result.length === 5) {
            for (let i = 0; i < 4; i++) {
                expect(result[i]!.coordinates).to.be.an('Array').lengthOf(3000)
            }
            expect(result[4]!.coordinates).to.be.an('Array').lengthOf(123)
        }
    })
})
