import { expect } from 'chai'
import { describe, it } from 'vitest'

import { PrintLayout, PrintLayoutAttribute } from '@/api/print.api.js'

describe('Print API unit tests', () => {
    describe('PrintLayoutAttribute tests', () => {
        it('Correctly tells that a param is invalid', () => {
            const testInstance = new PrintLayoutAttribute('test', 'String')
            expect(testInstance.isValid).to.be.false
        })
        it('Tells an attribute is valid if it has a default value', () => {
            const testInstance = new PrintLayoutAttribute('test', 'String', 'default')
            expect(testInstance.isValid).to.be.true
        })
        it('returns an empty array for scales if no clientInfo is defined', () => {
            const testInstance = new PrintLayoutAttribute('test', 'String')
            expect(testInstance.scales).to.be.an('Array').lengthOf(0)
        })
        it('returns the scales defined in clientInfo', () => {
            const scales = [1, 2, 3, 4]
            const testInstance = new PrintLayoutAttribute('test', 'String', null, null, {
                scales,
            })
            expect(testInstance.scales).to.eql(scales)
        })
    })
    describe('PrintLayout tests', () => {
        it('Filters out invalid attributes inputs', () => {
            const testInstance = new PrintLayout('test', null, '', undefined, 0)
            expect(testInstance.attributes).to.be.an('Array').lengthOf(0)
        })
        it('Correctly tells if all attributes are valid', () => {
            const attributeOne = new PrintLayoutAttribute('one', 'Number')
            const attributeTwo = new PrintLayoutAttribute('two', 'String', 'default value')
            const testInstance = new PrintLayout('test', attributeOne, attributeTwo)
            // attribute one requires a value
            expect(testInstance.isReadyToPrint).to.be.false

            attributeOne.value = 123
            expect(testInstance.isReadyToPrint).to.be.true
        })
        it('gets the scales from the "map" attribute correctly', () => {
            const attributeNotMapWithScales = new PrintLayoutAttribute(
                'not map',
                'String',
                null,
                null,
                { scales: [1, 2, 3] }
            )
            // testing param that aren't "map" but have a scale
            const scalesButNotInMapAttr = new PrintLayout('wrong', attributeNotMapWithScales)
            expect(scalesButNotInMapAttr.scales).to.be.an('Array').lengthOf(0)

            const scales = [5, 6, 7]
            const scalesInMapAttr = new PrintLayout(
                'correct',
                // also adding the wrong attribute here, it should be ignored when gathering scales
                attributeNotMapWithScales,
                new PrintLayoutAttribute('map', null, null, null, { scales })
            )
            expect(scalesInMapAttr.scales).to.eql(scales)
        })
    })
})
