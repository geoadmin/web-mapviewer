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
    it('uses the publication display cutoff', () => {
        const local = getSwissnamesLabelDistanceStyle({ maxDistance: 20000 })
        const street = getSwissnamesLabelDistanceStyle({ maxDistance: 5000 })

        expect(local.distanceDisplayCondition.near).to.equal(0)
        expect(local.distanceDisplayCondition.far).to.equal(20000)
        expect(street.distanceDisplayCondition.far).to.equal(5000)
    })

    it('keeps labels fully readable up to the cutoff (no scale or fade curves)', () => {
        const style = getSwissnamesLabelDistanceStyle({ maxDistance: 25000 })

        expect(style).to.not.have.property('scaleByDistance')
        expect(style).to.not.have.property('translucencyByDistance')
    })
})
