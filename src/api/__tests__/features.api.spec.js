import { expect } from 'chai'
import Feature from 'ol/Feature.js'
import Polygon from 'ol/geom/Polygon.js'
import { describe, it } from 'vitest'

import { EditableFeature, EditableFeatureTypes } from '@/api/features.api'
import { MEDIUM, RED } from '@/utils/featureStyleUtils'

const stringifiedTestObject = `{"id":"drawing_feature_2",\
"title":"This is a title",\
"description":"test",\
"featureType":"ANNOTATION",\
"textColor":{"name":"red","fill":"#ff0000","border":"#ffffff"},\
"fillColor":{"name":"red","fill":"#ff0000","border":"#ffffff"},\
"textSize":{"label":"medium_size","textScale":1.5,"iconScale":1},\
"icon":null,\
"iconSize":{"label":"medium_size","textScale":1.5,"iconScale":1}}`

const coordinates = [
    [46.50964, 8.06021],
    [46.9089, 8.4667],
    [46.96141, 7.78555],
    [46.50964, 8.06021],
]

const poly = new Polygon([coordinates])
const testFeature = new Feature({
    name: 'My Polygon',
    editableFeature: stringifiedTestObject,
})
testFeature.setGeometry(poly)

const args = {
    id: 'drawing_feature_2',
    coordinates: coordinates,
    title: 'This is a title',
    featureType: EditableFeatureTypes.ANNOTATION,
}
const testObject = {
    ...args,
    description: 'test',
    textColor: RED,
    textSize: MEDIUM,
    fillColor: RED,
    icon: null,
    iconSize: MEDIUM,
}

describe('Validate features api', () => {
    describe('Validate serialization and deserialization of the editable feature', () => {
        it('Serialize a default editable feature', () => {
            const feature = EditableFeature.newFeature(testObject)
            expect(feature).to.be.instanceOf(EditableFeature)
            const stringified = JSON.stringify(feature.serialize())
            // Cannot directly compare the two strings, as the order is undefined
            expect(JSON.parse(stringified)).to.deep.equal(JSON.parse(stringifiedTestObject))
        })
        it('Deserialize a default editable feature', () => {
            const editableFeature = testFeature.get('editableFeature')
            expect(editableFeature).to.be.not.null
            expect(editableFeature).to.be.equal(stringifiedTestObject)

            const reconstructed = EditableFeature.deserialize(testFeature)
            expect(reconstructed).to.be.instanceOf(EditableFeature)
            expect(reconstructed.id).to.be.equal(testObject.id)
            expect(reconstructed.coordinates).to.deep.equal(testObject.coordinates)
            expect(reconstructed.title).to.be.equal(testObject.title)
            expect(reconstructed.description).to.be.equal(testObject.description)
            expect(reconstructed.icon).to.be.equal(testObject.icon)

            /* If these classes are extended to save more data than what is serialized, these tests
            will need to be changed*/
            expect(reconstructed.textColor).to.deep.equal(testObject.textColor)
            expect(reconstructed.textSize).to.deep.equal(testObject.textSize)
            expect(reconstructed.fillColor).to.deep.equal(testObject.fillColor)
            expect(reconstructed.iconSize).to.deep.equal(testObject.iconSize)
            expect(reconstructed.featureType).to.deep.equal(testObject.featureType)
        })
    })
})
