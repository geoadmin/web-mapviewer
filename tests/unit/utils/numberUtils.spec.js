import { expect } from 'chai'
import { round, isNumber, randomIntBetween, format, formatThousand } from '@/utils/numberUtils'

describe('Unit test functions from numberUtils.js', () => {
    context('round(value, decimals)', () => {
        const numberToRound = 123.456789

        it('rounds a number without decimal if not specified', () => {
            expect(round(numberToRound)).to.eq(123)
        })

        it('takes how many wanted decimals into account', () => {
            expect(round(numberToRound, 0)).to.eq(123)
            expect(round(numberToRound, 1)).to.eq(123.5)
            expect(round(numberToRound, 2)).to.eq(123.46)
            expect(round(numberToRound, 3)).to.eq(123.457)
            expect(round(numberToRound, 4)).to.eq(123.4568)
            expect(round(numberToRound, 5)).to.eq(123.45679)
            expect(round(numberToRound, 6)).to.eq(123.456789)
            expect(round(numberToRound, 7)).to.eq(123.456789)
        })

        it('returns undefined for a string containg text', () => {
            expect(round('not a number')).to.eq(undefined)
        })

        it('returns undefined for an empty string', () => {
            expect(round('')).to.eq(undefined)
        })

        it('returns undefined if input value is null or undefined', () => {
            expect(round(null)).to.eq(undefined)
            expect(round(undefined)).to.eq(undefined)
        })

        it('rounds a stringified number correctly', () => {
            expect(round('' + numberToRound)).to.eq(123)
        })
    })

    context('isNumber(value)', () => {
        it('returns true for a valid number', () => {
            expect(isNumber(0)).to.be.true
            expect(isNumber(1)).to.be.true
        })

        it('handles string number correctly', () => {
            expect(isNumber('123.456')).to.be.true
            expect(isNumber('123')).to.be.true
            expect(isNumber('.456')).to.be.true
        })

        it('returns false for a string starting with a number but ending with text', () => {
            expect(isNumber('123.456hi')).to.be.false
        })

        it('returns false for a  strings finishing by a number', () => {
            expect(isNumber('?123.456')).to.be.false
        })

        it('rejects text strings', () => {
            expect(isNumber('stupid plain string')).to.be.false
        })
    })

    context('randomIntBetween(start, end)', () => {
        it('returns 0 when invalid start and end are provided', () => {
            expect(randomIntBetween(2, 1)).to.be.eq(0)
            expect(randomIntBetween(null, 2)).to.be.eq(0)
            expect(randomIntBetween(1, null)).to.be.eq(0)
            expect(randomIntBetween('1', 2)).to.be.eq(0)
            expect(randomIntBetween()).to.be.eq(0)
        })
        it('returns random value according to the given range', () => {
            const start = 0
            const end = 1000
            for (let i = 0; i < 10000; i += 1) {
                expect(randomIntBetween(start, end)).to.be.within(start, end)
            }
        })
    })

    context('format(value)', () => {
        it('returns undefined if the given value is not a number', () => {
            expect(format(null)).to.be.undefined
            expect(format(undefined)).to.be.undefined
            expect(format('')).to.be.undefined
        })
        it('returns number smaller than 1000 as is', () => {
            expect(format(0)).to.be.a('string').that.eq('0')
            expect(format(999)).to.be.a('string').that.eq('999')
        })
        it('rounds number to the second decimal (if they are floating numbers)', () => {
            expect(format(1.2345)).to.eq('1.23')
            // checking that it doesn't add unnecessary tailing 0
            expect(format(1.2)).to.eq('1.2')
        })
        it("uses ' as thousand separator", () => {
            expect(format(1000)).to.eq("1'000")
            expect(format(1000.12)).to.eq("1'000.12")
            expect(format(123456789.12)).to.eq("123'456'789.12")
        })
    })
    context('formatThousand(num, separator)', () => {
        it('returns a string with the thousands separator', () => {
            expect(formatThousand(1000, "'")).to.eq("1'000")
            expect(formatThousand(2000)).to.eq("2'000")
            expect(formatThousand(2123.345)).to.eq("2'123.345")
            expect(formatThousand(1.23456)).to.eq('1.23456')
            expect(formatThousand(2000, ' ')).to.eq('2 000')
        })
    })
})
