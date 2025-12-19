import { describe, expect, it } from 'vitest'

import searchAPI from '@/search'

describe('Builds object by extracting all relevant attributes from the backend', () => {
    describe('FeatureSearchResult.getSimpleTitle', () => {
        it('Returns title removing HTML', () => {
            const expectedResult = 'Some irrelevant stuff 123 Test'
            const expectedResultWrappedInHtml = '<i>Some irrelevant stuff</i> <b>123 Test</b>'
            expect(searchAPI.sanitizeTitle(expectedResultWrappedInHtml)).to.eq(expectedResult)
        })

        it('Returns title as is if no HTML is present', () => {
            const expectedResult = 'Test 123 Test'
            expect(searchAPI.sanitizeTitle(expectedResult)).to.eq(expectedResult)
        })
    })
})
