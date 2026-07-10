import { expect } from 'chai'
import { describe, it } from 'vitest'

import { getSwissnamesLabelDistanceStyle } from '@/modules/map/components/cesium/utils/swissnamesLabelEntities'

describe('Swissnames label distance styling', () => {
    it('uses the layer altitude band as the display cutoff', () => {
        const local = getSwissnamesLabelDistanceStyle({ maxAlt: 20000 })
        const street = getSwissnamesLabelDistanceStyle({ maxAlt: 5000 })

        expect(local.distanceDisplayCondition.near).to.equal(0)
        expect(local.distanceDisplayCondition.far).to.equal(20000)
        expect(street.distanceDisplayCondition.far).to.equal(5000)
    })

    it('caps regular layers so town names do not band along the horizon', () => {
        expect(
            getSwissnamesLabelDistanceStyle({ maxAlt: 150000 }).distanceDisplayCondition.far
        ).to.equal(25000)
        expect(
            getSwissnamesLabelDistanceStyle({ maxAlt: 500000 }).distanceDisplayCondition.far
        ).to.equal(25000)
    })

    it('lets only landmark tiers render to the horizon', () => {
        expect(
            getSwissnamesLabelDistanceStyle({ maxAlt: Infinity }).distanceDisplayCondition.far
        ).to.equal(500000)
        expect(
            getSwissnamesLabelDistanceStyle({ maxAlt: 2100000 }).distanceDisplayCondition.far
        ).to.equal(500000)
        expect(getSwissnamesLabelDistanceStyle({}).distanceDisplayCondition.far).to.equal(500000)
    })

    it('keeps labels fully readable up to the cutoff (no scale or fade curves)', () => {
        const style = getSwissnamesLabelDistanceStyle({ maxAlt: 50000 })

        expect(style).to.not.have.property('scaleByDistance')
        expect(style).to.not.have.property('translucencyByDistance')
    })
})
