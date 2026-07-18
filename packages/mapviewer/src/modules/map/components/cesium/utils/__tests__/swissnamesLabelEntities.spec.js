import { Cartesian3, EntityCollection } from 'cesium'
import { expect } from 'chai'
import { describe, it } from 'vitest'

import {
    addSwissnamesFeatureLabels,
    evictInvisibleSwissnamesLabels,
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
    it('keeps labels fully readable up to the cutoff (no scale or fade curves)', () => {
        const entities = new EntityCollection()
        const [label] = addSwissnamesFeatureLabels(
            entities,
            [{ text: 'Brienzersee', type: 'SEE' }],
            [Cartesian3.ZERO],
            { fontSize: 12, maxDistance: 25000 }
        )
        const distanceCondition = label.label.distanceDisplayCondition.getValue()

        expect(distanceCondition.near).to.equal(0)
        expect(distanceCondition.far).to.equal(25000)
        expect(label.label.scaleByDistance).to.equal(undefined)
        expect(label.label.translucencyByDistance).to.equal(undefined)
    })
})
