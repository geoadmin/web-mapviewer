import { expect } from 'chai'
import { describe, it } from 'vitest'

import { formatMeters, formatMinutesTime, formatPointCoordinates } from '@/utils/utils'

describe('utils', () => {
    describe('formatMinutesTime()', () => {
        it('format time', () => {
            expect(formatMinutesTime(null)).to.equal('-')
            expect(formatMinutesTime(42)).to.equal('42min')
            expect(formatMinutesTime(1200)).to.equal('20h')
            expect(formatMinutesTime(1230)).to.equal('20h 30min')
            expect(formatMinutesTime(1202)).to.equal('20h 2min')
        })
    })

    describe('formatMeters()', () => {
        it('format meters', () => {
            expect(formatMeters(42)).to.equal('42 m')
            expect(formatMeters(4002)).to.equal('4 km')
            expect(formatMeters(4200)).to.equal('4.2 km')
            expect(formatMeters(4200000)).to.equal("4'200 km")
        })
        it('format squared meters', () => {
            expect(formatMeters(42, { dim: 2 })).to.equal('42 m²')
            expect(formatMeters(4002, { dim: 2 })).to.equal("4'002 m²")
            expect(formatMeters(4200, { dim: 2 })).to.equal("4'200 m²")
            expect(formatMeters(4200000, { dim: 2 })).to.equal('4.2 km²')
            expect(formatMeters(4200000000, { dim: 2 })).to.equal("4'200 km²")
        })
    })

    describe('formatPointCoordinates()', () => {
        it('format coordinates', () => {
            expect(formatPointCoordinates([2533541.8057776038, 1151703.909974419])).to.eql(
                "2'533'542, 1'151'704"
            )
        })
    })
})
