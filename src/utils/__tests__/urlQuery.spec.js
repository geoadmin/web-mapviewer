import { expect } from 'chai'
import { describe, it } from 'vitest'

import { parseQuery, stringifyQuery } from '../url-router'

describe('Unit test function for parseQuery', () => {
    it('Decode + as space', () => {
        const parsed = parseQuery('layers=string+with+space')
        expect(parsed).to.be.instanceof(Object)
        expect(parsed.layers).to.be.equal('string with space')
    })
    it('Decode %20 as space', () => {
        const parsed = parseQuery('layers=string%20with%20space')
        expect(parsed).to.be.instanceof(Object)
        expect(parsed.layers).to.be.equal('string with space')
    })
    it('Decode kml layers param with | character', () => {
        const parsed = parseQuery('layers=KML%7Chttps://example.com')
        expect(parsed).to.be.instanceof(Object)
        expect(parsed.layers).to.be.equal('KML|https://example.com')
    })
    it('Decode external layers param with | character and encoded pipe in URL', () => {
        const parsed = parseQuery('layers=WMS%7Chttps://example.com?test=a%257Cb')
        expect(parsed).to.be.instanceof(Object)
        expect(parsed.layers).to.be.equal('WMS|https://example.com?test=a%7Cb')
    })
    it('Decode external layers param with url encoded by URLSearchParams', () => {
        const originalUrl = 'layers=WMS|https://test.com;hello,2,3'
        const parsed = parseQuery(`${new URLSearchParams(originalUrl).toString()}`)
        expect(parsed).to.be.instanceof(Object)
        expect(parsed.layers).to.be.equal(originalUrl.split('=')[1])
    })
})

describe('Unit test function for stringifyQuery', () => {
    it('Encode space characters', () => {
        const stringified = stringifyQuery({ layers: 'My drawing' })
        expect(stringified).to.be.equal('layers=My+drawing')
    })
    it('Encode kml layers param with | character', () => {
        const stringified = stringifyQuery({ layers: 'KML|https://example.com|My drawing' })
        expect(stringified).to.be.equal('layers=KML%7Chttps://example.com%7CMy+drawing')
    })
    it('Encode kml layers param with encoded | character', () => {
        const stringified = stringifyQuery({
            layers: 'KML|https://example.com?test=a%7Cb|My drawing',
        })
        expect(stringified).to.be.equal(
            'layers=KML%7Chttps://example.com?test=a%257Cb%7CMy+drawing'
        )
    })
})
