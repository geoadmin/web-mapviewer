import { EntityCollection } from 'cesium'
import { expect } from 'chai'
import { describe, it } from 'vitest'

import {
    evictInvisibleSwissnamesLabels,
    getSwissnamesLabelDistanceStyle,
} from '@/modules/map/components/cesium/utils/swissnamesLabelEntities'

describe('Swissnames label eviction', () => {
    it('removes invisible labels and their cache entries in one event batch', () => {
        const entities = new EntityCollection()
        const visibleLabel = entities.add({ id: 'visible' })
        const invisibleLabels = [
            entities.add({ id: 'invisible-label' }),
            entities.add({ id: 'invisible-stem' }),
        ]
        const tileCache = new Map([
            ['visible', [visibleLabel]],
            ['invisible', invisibleLabels],
            ['empty', []],
        ])

        let collectionChangeCount = 0
        entities.collectionChanged.addEventListener(() => {
            collectionChangeCount += 1
        })

        evictInvisibleSwissnamesLabels(entities, tileCache, new Set(['visible']))

        expect(collectionChangeCount).to.equal(1)
        expect(entities.values).to.have.length(1)
        expect(entities.values[0]).to.equal(visibleLabel)
        expect([...tileCache.keys()]).to.deep.equal(['visible'])
    })
})

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
