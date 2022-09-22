import { FeatureSearchResult } from '@/api/search.api'
import { expect } from 'chai'
import { describe, it } from 'vitest'

describe('Builds object by extracting all relevant attributes from the backend', () => {
    describe('FeatureSearchResult.getSimpleTitle', () => {
        it('Returns title removing HTML', () => {
            const expectedResult = 'Test 123 Test'
            const expectedResultWrappedInHtml = `<i>Some irrelevant stuff</i><b>${expectedResult}</b>`
            const testInstance = new FeatureSearchResult(
                expectedResultWrappedInHtml,
                '',
                123,
                [],
                [],
                10
            )
            expect(testInstance.getSimpleTitle()).to.eq(expectedResult)
        })

        it('Returns title as is if no HTML is present', () => {
            const expectedResult = 'Test 123 Test'
            const testInstance = new FeatureSearchResult(expectedResult, '', 123, [], [], 10)
            expect(testInstance.getSimpleTitle()).to.eq(expectedResult)
        })
    })
})
