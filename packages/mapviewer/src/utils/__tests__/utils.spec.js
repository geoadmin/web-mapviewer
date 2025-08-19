import { expect } from 'chai'
import { describe, it } from 'vitest'

import {
    humanFileSize,
    parseUrlHashQuery,
    transformUrlMapToEmbed,
    getLongestCommonPrefix,
} from '@/utils/utils'

describe('utils', () => {
    describe('transformUrlMapToEmbed', () => {
        it('transform #/map to #/embed', () => {
            expect(transformUrlMapToEmbed('https://map.geo.admin.ch/index.html#/map')).to.equal(
                'https://map.geo.admin.ch/index.html#/embed'
            )
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
    describe('humanFileSize', () => {
        it('format correctly valid size', () => {
            expect(humanFileSize(0)).to.be.equal('0 B')
            expect(humanFileSize(1)).to.be.equal('1 B')
            expect(humanFileSize(800)).to.be.equal('800 B')
            expect(humanFileSize(1024)).to.be.equal('1 kB')
            expect(humanFileSize(1025)).to.be.equal('1 kB')
            expect(humanFileSize(4 * 1024)).to.be.equal('4 kB')
            expect(humanFileSize(4 * 1024 * 1024)).to.be.equal('4 MB')
            expect(humanFileSize(4.3 * 1024 * 1024)).to.be.equal('4.3 MB')
        })
    })

    describe('getLongestCommonPrefix', () => {
        it('returns the longest common prefix for a list of URLs', () => {
            // Empty array
            expect(getLongestCommonPrefix([])).to.equal('')

            // Single URL
            let urls = ['https://example.com/path/to/resource']
            expect(getLongestCommonPrefix(urls)).to.equal('https://example.com/path/to/resource')

            // Multiple URLs with common prefix
            urls = [
                'https://example.com/path/to/resource',
                'https://example.com/path/to/another',
                'https://example.com/path/to/something-else',
            ]
            expect(getLongestCommonPrefix(urls)).to.equal('https://example.com/path/to/')

            // Multiple URLs with no common prefix
            urls = ['https://example1.com/path', 'https://example2.com/path']
            expect(getLongestCommonPrefix(urls)).to.equal('')

            // Multiple URLs with one URL is the common prefix
            urls = ['https://example.com/path', 'https://example.com/path/to']
            expect(getLongestCommonPrefix(urls)).to.equal('https://example.com/path')
        })
    })
})
