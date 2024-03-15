import { expect } from 'chai'
import { describe, it } from 'vitest'

import {
    formatMeters,
    formatMinutesTime,
    formatPointCoordinates,
    parseUrlHashQuery,
    transformUrlMapToEmbed,
} from '@/utils/utils'

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

    describe('transformUrlMapToEmbed', () => {
        it('transform #/map to #/embed', () => {
            expect(transformUrlMapToEmbed('https://map.geo.admin.ch/#/map')).to.equal(
                'https://map.geo.admin.ch/#/embed'
            )
            expect(transformUrlMapToEmbed('http://map.geo.admin.ch/#/map')).to.equal(
                'http://map.geo.admin.ch/#/embed'
            )
            expect(transformUrlMapToEmbed('http://map.geo.admin.ch/#/map?')).to.equal(
                'http://map.geo.admin.ch/#/embed?'
            )
            expect(transformUrlMapToEmbed('https://map.geo.admin.ch/#/map?lang=de')).to.equal(
                'https://map.geo.admin.ch/#/embed?lang=de'
            )
            expect(
                transformUrlMapToEmbed(
                    'https://map.geo.admin.ch/#/map?lang=de&layers=https://test.com?hello=world'
                )
            ).to.equal(
                'https://map.geo.admin.ch/#/embed?lang=de&layers=https://test.com?hello=world'
            )
        })
        it('does not transform non #/map url', () => {
            const urls = [
                'https://map.geo.admin.ch/#/mapview',
                'https://map.geo.admin.ch/#/map/view',
                'https://map.geo.admin.ch/#/hello',
                'https://map.geo.admin.ch/#/hello?lang=de',
                'https://map.geo.admin.ch/map',
                'https://map.geo.admin.ch/map?de',
                'https://map.geo.admin.ch/test#/map',
            ]
            urls.forEach((url) => expect(transformUrlMapToEmbed(url)).to.equal(url))
        })
    })
    describe('parseUrlHashQuery', () => {
        it('parse correctly url', () => {
            let result = parseUrlHashQuery('https://test.com/my-path/#test?hello')
            expect(result.urlObj).not.to.be.undefined
            expect(result.urlObj).not.to.be.null
            expect(result.hash).to.equal('#test')
            expect(result.query).to.equal('?hello')

            result = parseUrlHashQuery('https://test.com/#test/bla?hello')
            expect(result.urlObj).not.to.be.undefined
            expect(result.urlObj).not.to.be.null
            expect(result.hash).to.equal('#test/bla')
            expect(result.query).to.equal('?hello')

            result = parseUrlHashQuery('https://test.com/#/test/bla?')
            expect(result.urlObj).not.to.be.undefined
            expect(result.urlObj).not.to.be.null
            expect(result.hash).to.equal('#/test/bla')
            expect(result.query).to.equal('?')

            result = parseUrlHashQuery('https://test.com/#/test/bla?hello=my_value?test')
            expect(result.urlObj).not.to.be.undefined
            expect(result.urlObj).not.to.be.null
            expect(result.hash).to.equal('#/test/bla')
            expect(result.query).to.equal('?hello=my_value?test')

            result = parseUrlHashQuery(
                'https://test.com/hello?key=value#/test/bla?hello=my_value?test'
            )
            expect(result.urlObj).not.to.be.undefined
            expect(result.urlObj).not.to.be.null
            expect(result.hash).to.equal('#/test/bla')
            expect(result.query).to.equal('?hello=my_value?test')

            result = parseUrlHashQuery('https://test.com/hello?key=value')
            expect(result.urlObj).not.to.be.undefined
            expect(result.urlObj).not.to.be.null
            expect(result.hash).to.equal('')
            expect(result.query).to.equal('')
        })
    })
})
