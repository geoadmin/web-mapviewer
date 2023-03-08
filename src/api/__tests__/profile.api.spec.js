import ElevationProfile from '@/api/profile/ElevationProfile.class'
import ElevationProfilePoint from '@/api/profile/ElevationProfilePoint.class'
import ElevationProfileSegment from '@/api/profile/ElevationProfileSegment.class'
import { expect } from 'chai'
import { describe, it } from 'vitest'

const testProfile = new ElevationProfile([
    new ElevationProfileSegment([
        new ElevationProfilePoint([0, 0], 0, 100),
        new ElevationProfilePoint([0, 50], 50, 210),
        new ElevationProfilePoint([0, 150], 150, 90),
        new ElevationProfilePoint([50, 150], 200, 200),
    ]),
])

describe('Profile calculation', () => {
    it('returns 0 for all multi-points calculation if there is less than two points', () => {
        const profileWithoutElevationData = new ElevationProfile([
            new ElevationProfileSegment([
                // using 1 everywhere (except elevation) in order to check it won't be used by calculations
                new ElevationProfilePoint([1, 1], 1, null),
            ]),
        ])
        expect(profileWithoutElevationData.hasElevationData).to.be.false
        expect(profileWithoutElevationData.hasDistanceData).to.be.true
        expect(profileWithoutElevationData.maxDist).to.eq(1) // dist is a unique point calculation, it should be there
        expect(profileWithoutElevationData.elevationDifference).to.eq(0)
        expect(profileWithoutElevationData.totalAscent).to.eq(0)
        expect(profileWithoutElevationData.totalDescent).to.eq(0)
        expect(profileWithoutElevationData.hikingTime).to.eq(0)
        expect(profileWithoutElevationData.coordinates).to.be.an('Array').lengthOf(1)
        const [[x, y]] = profileWithoutElevationData.coordinates
        expect(x).to.eq(1)
        expect(y).to.eq(1)
    })
    it('tells it has no elevation data if the only segment contains point with and without elevation', () => {
        const malformedProfile = new ElevationProfile([
            new ElevationProfileSegment([
                // using 1 everywhere (except elevation) in order to check it won't be used by calculations
                new ElevationProfilePoint([1, 1], 0, null),
                new ElevationProfilePoint([2, 1], 1, 1),
            ]),
        ])
        expect(malformedProfile.hasElevationData).to.be.false
        expect(malformedProfile.hasDistanceData).to.be.true
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
