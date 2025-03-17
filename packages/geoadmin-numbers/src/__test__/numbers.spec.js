import { expect } from 'chai'
import { describe, it } from 'vitest'

import {
    closest,
    format,
    formatThousand,
    isNumber,
    isTimestampYYYYMMDD,
    randomIntBetween,
    round,
    wrapDegrees,
} from '@/index'

describe('Unit test functions from numbers utils', () => {
    describe('round(value, decimals)', () => {
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

        it('correctly raise or floor values depending on decimal', () => {
            expect(round(0.4, 0)).to.eq(0)
            expect(round(0.5, 0)).to.eq(1)

            expect(round(0.44, 1)).to.eq(0.4)
            expect(round(0.45, 1)).to.eq(0.5)

            expect(round(0.444, 2)).to.eq(0.44)
            expect(round(0.445, 2)).to.eq(0.45)
        })

        it('returns NaN for a string containg text', () => {
            expect(round('not a number')).to.be.NaN
        })

        it('returns NaN for an empty string', () => {
            expect(round('')).to.be.NaN
        })

        it('returns NaN if input value is null or undefined', () => {
            expect(round(null)).to.be.NaN
            expect(round(undefined)).to.be.NaN
        })

        it('rounds a stringified number correctly', () => {
            expect(round('' + numberToRound)).to.eq(123)
        })
    })

    describe('closest(value, fromList)', () => {
        it('returns the given value if the list of value is invalid or empty', () => {
            const value = 1234.56
            expect(closest(value)).to.eq(value)
            expect(closest(value, null)).to.eq(value)
            expect(closest(value, undefined)).to.eq(value)
            expect(closest(value, [])).to.eq(value)
        })
        it('returns a match', () => {
            const list = [0, 1, 2]
            expect(closest(0.5, list)).to.eq(0)
            // testing numbers between 0.51 and 1.50
            for (let value = 0.51; value <= 1.5; value += 0.01) {
                expect(closest(value, list)).to.eq(1)
            }
            expect(closest(1.51, list)).to.eq(2)
        })
    })

    describe('isNumber(value)', () => {
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

    describe('randomIntBetween(start, end)', () => {
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
        it('returns random value according to the given range when starting elsewhere than 0', () => {
            const start = 2165123
            const end = 2565228
            for (let i = 0; i < 10000; i += 1) {
                expect(randomIntBetween(start, end)).to.be.within(start, end)
            }
        })
    })

    describe('format(value)', () => {
        it('returns undefined if the given value is not a number', () => {
            expect(format(null)).to.be.a('string').empty
            expect(format(undefined)).to.be.a('string').empty
            expect(format('')).to.be.a('string').empty
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

    describe('formatThousand(num, separator)', () => {
        it('returns a string with the thousands separator', () => {
            expect(formatThousand(1000, "'")).to.eq("1'000")
            expect(formatThousand(2000)).to.eq("2'000")
            expect(formatThousand(2123.345)).to.eq("2'123.345")
            expect(formatThousand(1.23456)).to.eq('1.23456')
            expect(formatThousand(2000, ' ')).to.eq('2 000')
        })
        it('does not remove trailing 0 if the input is a string', () => {
            expect(formatThousand('1000.000')).to.eq("1'000.000")
        })
    })

    describe('wrapDegrees(angle)', () => {
        it('returns the angle untouched if already in range', () => {
            expect(wrapDegrees(-359.99)).to.eq(-359.99)
            expect(wrapDegrees(0)).to.eq(0)
            expect(wrapDegrees(359.99)).to.eq(359.99)
        })
        it('wraps an angle that are greater than 0 to the 0...360 range', () => {
            expect(wrapDegrees(360)).to.eq(0)
            expect(wrapDegrees(361)).to.eq(1)
            expect(wrapDegrees(540)).to.eq(180)
            expect(wrapDegrees(720)).to.eq(0)
        })
        it('wraps an angle that are smaller than zero to match the -360...0 range', () => {
            expect(wrapDegrees(-360)).to.eq(0)
            expect(wrapDegrees(-361)).to.eq(-1)
            expect(wrapDegrees(-540)).to.eq(-180)
            expect(wrapDegrees(-720)).to.eq(0)
        })
    })

    describe('isTimestampYYYYMMDD(timestamp)', () => {
        it('match valid timestamp YYYYMMDD', () => {
            expect(isTimestampYYYYMMDD('99990101')).to.be.true
            expect(isTimestampYYYYMMDD('99991231')).to.be.true
            expect(isTimestampYYYYMMDD('20240101')).to.be.true
            expect(isTimestampYYYYMMDD('20241201')).to.be.true
            expect(isTimestampYYYYMMDD('20241231')).to.be.true
            expect(isTimestampYYYYMMDD('30000101')).to.be.true
            expect(isTimestampYYYYMMDD('00000101')).to.be.true
            expect(isTimestampYYYYMMDD('10000101')).to.be.true
        })
        it('don not match invalid timestamp YYYYMMDD', () => {
            expect(isTimestampYYYYMMDD('20241301')).to.be.false
            expect(isTimestampYYYYMMDD('20241232')).to.be.false
            expect(isTimestampYYYYMMDD('30000000')).to.be.false
            expect(isTimestampYYYYMMDD('00000000')).to.be.false
            expect(isTimestampYYYYMMDD('20240000')).to.be.false
            expect(isTimestampYYYYMMDD('20240100')).to.be.false
            expect(isTimestampYYYYMMDD('20240001')).to.be.false
            expect(isTimestampYYYYMMDD('99999999')).to.be.false
            expect(isTimestampYYYYMMDD('99990000')).to.be.false
            expect(isTimestampYYYYMMDD('99991232')).to.be.false
            expect(isTimestampYYYYMMDD('99991301')).to.be.false
        })
    })
})
