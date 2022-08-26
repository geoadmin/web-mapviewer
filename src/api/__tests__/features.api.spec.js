import { describe, it } from 'vitest'
import { expect } from 'chai'
import { EditableFeatureTypes, EditableFeature } from '@/api/features.api'
import { MEDIUM, RED } from '@/utils/featureStyleUtils'

const args = {
    id: 'drawing_feature_2',
    coordinates: null,
    title: 'This is a title',
    featureType: EditableFeatureTypes.ANNOTATION,
}
const testObject = {
    ...args,
    description: '',
    textColor: RED,
    textSize: MEDIUM,
    fillColor: RED,
    icon: null,
    iconSize: MEDIUM,
}
const stringifiedTestObject = `{"id":"drawing_feature_2",\
"coordinates":null,\
"title":"This is a title",\
"description":"",\
"featureType":"ANNOTATION",\
"textColor":{"name":"red","fill":"#ff0000","border":"#ffffff"},\
"textSize":{"label":"medium_size","textScale":1.5,"iconScale":1},\
"fillColor":{"name":"red","fill":"#ff0000","border":"#ffffff"},\
"icon":null,\
"iconSize":{"label":"medium_size","textScale":1.5,"iconScale":1}}`

describe('Validate features api', () => {
    describe('Validate serialization and deserialization of the editable feature', () => {
        it('Serialize a default editable feature', () => {
            const feature = EditableFeature.constructWithObject(args)
            expect(feature).to.be.instanceOf(EditableFeature)
            const stringified = JSON.stringify(feature.getStrippedObject())
            expect(stringified).to.equal(stringifiedTestObject)
        })
        it('Deserialize a default editable feature', () => {
            const reconstructed = EditableFeature.recreateObject(JSON.parse(stringifiedTestObject))
            expect(reconstructed).to.be.instanceOf(EditableFeature)
            expect(reconstructed.id).to.be.equal(testObject.id)
            expect(reconstructed.coordinates).to.be.equal(testObject.coordinates)
            expect(reconstructed.title).to.be.equal(testObject.title)
            expect(reconstructed.description).to.be.equal(testObject.description)
            expect(reconstructed.icon).to.be.equal(testObject.icon)

            /* If theses classes are extended to save more data than what is serialized, these tests
            will need to be changed*/
            expect(reconstructed.textColor).to.deep.equal(testObject.textColor)
            expect(reconstructed.textSize).to.deep.equal(testObject.textSize)
            expect(reconstructed.fillColor).to.deep.equal(testObject.fillColor)
            expect(reconstructed.iconSize).to.deep.equal(testObject.iconSize)
            expect(reconstructed.featureType).to.deep.equal(testObject.featureType)
        })
    })
})
