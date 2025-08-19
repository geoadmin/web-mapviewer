import { expect } from 'chai'
import { describe, it } from 'vitest'

import { transformFileUrl } from '../file-proxy.api'

describe('Serice-proxy tests', () => {
    describe('transformFileUrl', () => {
        it('returns undefined when the input is invalid', () => {
            expect(transformFileUrl(null)).to.be.undefined
            expect(transformFileUrl(undefined)).to.be.undefined
            expect(transformFileUrl('some non URL string')).to.be.undefined
        })
        it('returns the URL transformed', () => {
            expect(transformFileUrl('http://some-file.kml?one=1&foo=bar')).to.eq(
                `http/some-file.kml${encodeURIComponent('?one=1&foo=bar')}`
            )
        })
    })
})
