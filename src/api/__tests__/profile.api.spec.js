import { GeoAdminProfile, ProfilePoint } from '@/api/profile.api'
import { expect } from 'chai'
import { describe, it } from 'vitest'

const testProfile = new GeoAdminProfile([
    new ProfilePoint(0, [0, 0], 100),
    new ProfilePoint(50, [0, 50], 200),
    new ProfilePoint(150, [0, 150], 90),
    new ProfilePoint(200, [50, 150], 210),
])

describe('Profile calculation', () => {
    it('returns 0 for all calculation if there is less than two points', () => {
        const nearlyEmptyProfile = new GeoAdminProfile([
            // using 1 everywhere in order to check it won't be used by calculations
            new ProfilePoint(1, [1, 1], 1),
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
        // comparing start and finish, so 210 - 100
        expect(testProfile.elevationDifference).to.eq(110)
    })
    it('calculates total ascent correctly', () => {
        // from point 1 to 2 : 100
        // from point 3 to 4 : 120
        // total: 220
        expect(testProfile.totalAscent).to.eq(220)
    })
    it('calculates total descent correctly', () => {
        // from 200 to 90, so -110, but it's in absolute form
        expect(testProfile.totalDescent).to.eq(110)
    })
    it('calculates slope distance correctly', () => {
        // here we calculate with Pythagoras between each point
        // so that we take into account the difference of altitude/elevation
        // between 1 and 2 : 50m of distance and 100m of elevation, so sqrt(50^2 + 100^2) ~= 111.80m
        // between 2 and 3 : 100m of distance and -110m of elevation, so sqrt(100^2 + -110^2) ~= 148.66m
        // between 3 and 4 : 50m of distance and 120m of elevation, so sqrt(50^2 + 120^2) = 130m
        // total : 390.46m
        expect(testProfile.slopeDistance).to.approximately(390.46, 0.01)
    })
})
