import { expect } from 'chai'
import { describe, it } from 'vitest'

import { PrintLayout, PrintLayoutAttribute } from '@/api/print.api.js'
import { MIN_PRINT_SCALE_SIZE, PRINT_DPI_COMPENSATION } from '@/config/print.config'
// We need to import the router here to avoid error when initializing router plugins, this is
// needed since some store plugins might require access to router to get the query parameters
// (e.g. topic management plugin)
import router from '@/router' // eslint-disable-line no-unused-vars
import store from '@/store' // eslint-disable-line no-unused-vars
import { adjustWidth } from '@/utils/styleUtils'

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
        it('calculate the width correctly with the "adjustWidth" function', () => {
            // invalid values should return 0
            expect(adjustWidth(100, 'invalid value')).to.eql(0)
            expect(adjustWidth(100, null)).to.eql(0)
            expect(adjustWidth(100, undefined)).to.eql(0)
            expect(adjustWidth(null, 254)).to.eql(0)
            expect(adjustWidth(undefined, 254)).to.eql(0)
            expect(adjustWidth('invalid value', 254)).to.eql(0)
            // the dpi parameter should be a positive number
            expect(adjustWidth(100, 0)).to.eql(0)
            expect(adjustWidth(100, -15)).to.eql(0)
            // checking with a slight margin for float rounding errors.
            expect(adjustWidth(100, 254)).to.be.closeTo(
                (100 * PRINT_DPI_COMPENSATION) / 254,
                1 / 254
            )
            // we check that the minimum print scale size is correctly enforced
            expect(adjustWidth(MIN_PRINT_SCALE_SIZE / 1000, 254)).to.be.closeTo(
                MIN_PRINT_SCALE_SIZE,
                MIN_PRINT_SCALE_SIZE / 2
            )
        })
    })
})
