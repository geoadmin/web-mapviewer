import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import LayerTimeConfigEntry from '@/api/layers/LayerTimeConfigEntry.class'
import {
    findMostRecentCommonYear,
    getCommonYears,
} from '@/modules/menu/components/timeslider/timeSlider.utils'
import { expect } from 'chai'
import { describe, it } from 'vitest'

describe('Unit test functions from timeSlider.utils.js', () => {
    describe('findMostRecentCommonYear', () => {
        it('returns null if no valid time config is given', () => {
            try {
                expect(findMostRecentCommonYear(null)).to.be.null
                expect(findMostRecentCommonYear(undefined)).to.be.null
                expect(findMostRecentCommonYear([])).to.be.null
                expect(findMostRecentCommonYear([0])).to.be.null
                expect(findMostRecentCommonYear([0, 1])).to.be.null
                expect(findMostRecentCommonYear([{}, {}])).to.be.null
            } catch (err) {
                it.fails('It should handle wrong input without raising errors')
            }
        })
        it('returns the most common year of the only time config, if given alone', () => {
            expect(
                findMostRecentCommonYear([
                    new LayerTimeConfig('last', [
                        new LayerTimeConfigEntry('20000101'),
                        new LayerTimeConfigEntry('20100101'),
                    ]),
                ])
            ).to.eq(2010)
        })
    })
    describe('getCommonYears', () => {
        /**
         * @param {Number[]} groupOfYears
         * @returns {LayerTimeConfig[]}
         */
        function generateTimeConfig(...groupOfYears) {
            return groupOfYears.map(
                (years) =>
                    new LayerTimeConfig(
                        'last',
                        years.map((year) => new LayerTimeConfigEntry(`${year}0101`))
                    )
            )
        }
        it('returns an empty array if invalid inputs are given', () => {
            try {
                expect(getCommonYears(null)).to.be.an.empty('Array')
                expect(getCommonYears(undefined)).to.be.an.empty('Array')
                expect(getCommonYears([])).to.be.an.empty('Array')
                expect(getCommonYears([0])).to.be.an.empty('Array')
                expect(getCommonYears([0, 1])).to.be.an.empty('Array')
                expect(getCommonYears([{}, {}])).to.be.an.empty('Array')
            } catch (err) {
                it.fails('It should not raise error when invalid inputs are given')
            }
        })
        it('returns all years from the time config if only one time config is given', () => {
            const years = [1237, 1236, 1235, 1234]
            const commonYears = getCommonYears(generateTimeConfig(years))
            expect(commonYears).to.be.an('Array').of.length(years.length)
            // checking that the order hasn't been changed, as years was sorted chronologically
            commonYears.forEach((commonYear, index) => {
                expect(commonYear).to.eq(years[index])
            })
        })
        it('sorts common years chronologically even if only one time config is given', () => {
            const years = [1000, 1005, 1003]
            const sortedCommonYears = getCommonYears(generateTimeConfig(years))
            expect(sortedCommonYears).to.be.an('Array').of.length(years.length)
            // 1005 should be the first year as it is closer to now as 1000
            expect(sortedCommonYears[0]).to.eq(years[1])
            // second year should be 1003
            expect(sortedCommonYears[1]).to.eq(years[2])
            // and last should be 1000
            expect(sortedCommonYears[2]).to.eq(years[0])
        })
        it('gives all common years correctly with 2 time configs', () => {
            const expectedCommonYears = [1000, 1005, 1008]
            const nonCommonYears = [1002, 1003, 1004, 1007]
            const years1 = [...expectedCommonYears, nonCommonYears[0], nonCommonYears[2]]
            const years2 = [...expectedCommonYears, nonCommonYears[1], nonCommonYears[3]]
            const commonYears = getCommonYears(generateTimeConfig(years1, years2))
            expect(commonYears).to.be.an('Array').of.length(expectedCommonYears.length)
            expect(commonYears).have.members(expectedCommonYears)
            expect(commonYears).to.not.include.members(nonCommonYears)
            // checking ordering, as it should have changed
            // first year should be 1008
            expect(commonYears[0]).to.eq(expectedCommonYears[2])
            // second should be 1005
            expect(commonYears[1]).to.eq(expectedCommonYears[1])
            // last should be 1000
            expect(commonYears[2]).to.eq(expectedCommonYears[0])
        })
        it('gives all common years correctly with more than 2 time configs', () => {
            const expectedCommonYears = [2010, 2000, 1990, 1980]
            const years1 = [...expectedCommonYears, 2001, 2002, 2003, 2004, 2005]
            const years2 = [...expectedCommonYears, 1970, 1960, 1950]
            const years3 = [...expectedCommonYears, 2021, 2022]
            const years4 = [...expectedCommonYears]
            const commonYears = getCommonYears(generateTimeConfig(years1, years2, years3, years4))
            expect(commonYears).to.be.an('Array').of.length(expectedCommonYears.length)
            expect(commonYears).have.members(expectedCommonYears)
        })
        it('returns an empty array if no common years is found between the time configs', () => {
            const years1 = [1000, 1001, 1002, 1003]
            const years2 = [1004, 1005, 1006, 1007]
            const years3 = [1008, 1009, 1010, 1011]
            const commonYears = getCommonYears(generateTimeConfig(years1, years2, years3))
            expect(commonYears).to.be.an('Array').that.is.empty
        })
    })
})
