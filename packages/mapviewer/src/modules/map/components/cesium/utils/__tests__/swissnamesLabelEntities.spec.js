import { Cartesian2, Cartesian3, EntityCollection, LabelStyle, VerticalOrigin } from 'cesium'
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
        const [label, stem] = addSwissnamesFeatureLabels(
            entities,
            [{ text: 'Brienzersee', type: 'SEE' }],
            [Cartesian3.ZERO],
            { fontSize: 12, maxDistance: 25000 }
        )
        const distanceCondition = label.label.distanceDisplayCondition.getValue()

        expect(entities.values).to.deep.equal([label, stem])
        expect(label.label.text.getValue()).to.equal('Brienzersee')
        expect(label.label.font.getValue()).to.equal('12px Arial, sans-serif')
        expect(label.label.showBackground.getValue()).to.equal(true)
        expect(label.label.verticalOrigin.getValue()).to.equal(VerticalOrigin.BOTTOM)
        expect(stem.label.text.getValue()).to.equal('|')
        expect(stem.label.font.getValue()).to.equal('12px monospace')
        expect(stem.label.style.getValue()).to.equal(LabelStyle.FILL_AND_OUTLINE)
        expect(stem.label.pixelOffset.getValue()).to.deep.equal(new Cartesian2(0, 4))
        expect(stem.label.distanceDisplayCondition.getValue()).to.deep.equal(distanceCondition)
        expect(distanceCondition.near).to.equal(0)
        expect(distanceCondition.far).to.equal(25000)
        expect(label.label.scaleByDistance).to.equal(undefined)
        expect(label.label.translucencyByDistance).to.equal(undefined)
    })
})
