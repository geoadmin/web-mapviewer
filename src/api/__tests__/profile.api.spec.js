import { ElevationProfile, ElevationProfilePoint } from '@/api/profile.api'
import { expect } from 'chai'
import { describe, it } from 'vitest'

const testProfile = new ElevationProfile([
    new ElevationProfilePoint(0, [0, 0], 100),
    new ElevationProfilePoint(50, [0, 50], 210),
    new ElevationProfilePoint(150, [0, 150], 90),
    new ElevationProfilePoint(200, [50, 150], 200),
])

describe('Profile calculation', () => {
    it('returns 0 for all calculation if there is less than two points', () => {
        const nearlyEmptyProfile = new ElevationProfile([
            // using 1 everywhere in order to check it won't be used by calculations
            new ElevationProfilePoint(1, [1, 1], 1),
        ])
        expect(nearlyEmptyProfile.hasData).to.be.false
        expect(nearlyEmptyProfile.maxDist).to.eq(0)
        expect(nearlyEmptyProfile.elevationDifference).to.eq(0)
        expect(nearlyEmptyProfile.totalAscent).to.eq(0)
        expect(nearlyEmptyProfile.totalDescent).to.eq(0)
        expect(nearlyEmptyProfile.hikingTime).to.eq(0)
        expect(nearlyEmptyProfile.coordinates).to.be.an('Array').lengthOf(1)
        const [[x, y]] = nearlyEmptyProfile.coordinates
        expect(x).to.eq(1)
        expect(y).to.eq(1)
    })
    it('gives the correct max/min distance and elevations', () => {
        expect(testProfile.maxDist).to.eq(200)
        expect(testProfile.maxElevation).to.eq(210)
        expect(testProfile.minElevation).to.eq(90)
    })
    it('calculates elevation difference correctly', () => {
        // comparing start and finish, so 200 - 100
        expect(testProfile.elevationDifference).to.eq(100)
    })
    it('calculates total ascent correctly', () => {
        // from point 1 to 2 : 110
        // from point 3 to 4 : 110
        // total: 220
        expect(testProfile.totalAscent).to.eq(220)
    })
    it('calculates total descent correctly', () => {
        // from 210 to 90, so -120, but it's in absolute form
        expect(testProfile.totalDescent).to.eq(120)
    })
    it('calculates slope distance correctly', () => {
        // here we calculate with Pythagoras between each point
        // so that we take into account the difference of altitude/elevation
        // between 1 and 2 : 50m of distance and 110m of elevation, so sqrt(50^2 + 110^2) ~= 120.83m
        // between 2 and 3 : 100m of distance and -120m of elevation, so sqrt(100^2 + -120^2) ~= 156.20m
        // between 3 and 4 : 50m of distance and 110m of elevation, so sqrt(50^2 + 110^2) ~= 120.83m
        // total : 397.86m
        expect(testProfile.slopeDistance).to.approximately(397.86, 0.01)
    })
})
