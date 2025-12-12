import { describe, expect, it } from 'vitest'

import type { ElevationProfilePoint } from '@/profile.api'
import type { ElevationProfileMetadata } from '@/utils'

import getProfileMetadata, { formatMinutesTime } from '@/utils'

const testPoints: ElevationProfilePoint[] = [
    { coordinate: [0, 0], dist: 0, elevation: 100, hasElevationData: true },
    { coordinate: [0, 50], dist: 50, elevation: 210, hasElevationData: true },
    { coordinate: [0, 150], dist: 150, elevation: 90, hasElevationData: true },
    { coordinate: [50, 150], dist: 200, elevation: 200, hasElevationData: true },
]

describe('Profile calculation => getProfileMetadata(points)', () => {
    it('returns 0 for all multi-points calculation if there is less than two points', () => {
        const result: ElevationProfileMetadata = getProfileMetadata([
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
        const result: ElevationProfileMetadata = getProfileMetadata([
            { coordinate: [1, 1], dist: 0, hasElevationData: false },
            { coordinate: [2, 1], dist: 1, elevation: 1, hasElevationData: true },
        ])
        expect(result.hasElevationData).to.be.true
        expect(result.hasDistanceData).to.be.true
    })
    it('gives the correct max/min distance and elevations', () => {
        const result: ElevationProfileMetadata = getProfileMetadata(testPoints)
        expect(result.totalLinearDist).to.eq(200)
        expect(result.maxElevation).to.eq(210)
        expect(result.minElevation).to.eq(90)
    })
    it('calculates elevation difference correctly', () => {
        const result: ElevationProfileMetadata = getProfileMetadata(testPoints)
        // comparing start and finish, so 200 - 100
        expect(result.elevationDifference).to.eq(100)
    })
    it('calculates total ascent correctly', () => {
        const result: ElevationProfileMetadata = getProfileMetadata(testPoints)
        // from point 1 to 2 : 110
        // from point 3 to 4 : 110
        // total: 220
        expect(result.totalAscent).to.eq(220)
    })
    it('calculates total descent correctly', () => {
        const result: ElevationProfileMetadata = getProfileMetadata(testPoints)
        // from 210 to 90, so -120, but it's in absolute form
        expect(result.totalDescent).to.eq(120)
    })
    it('calculates slope distance correctly', () => {
        const result: ElevationProfileMetadata = getProfileMetadata(testPoints)
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
        expect(formatMinutesTime()).to.equal('-')
        expect(formatMinutesTime(42)).to.equal('42min')
        expect(formatMinutesTime(1200)).to.equal('20h')
        expect(formatMinutesTime(1230)).to.equal('20h 30min')
        expect(formatMinutesTime(1202)).to.equal('20h 2min')
    })
})
