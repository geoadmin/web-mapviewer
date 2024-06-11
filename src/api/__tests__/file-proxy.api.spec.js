import { expect } from 'chai'
import { describe, it } from 'vitest'

import { transformFileUrl } from '@/api/file-proxy.api.js'

describe('Serice-proxy tests', () => {
    describe('transformFileUrl', () => {
        it('returns null when the input is invalid', () => {
            expect(transformFileUrl(null)).to.be.null
            expect(transformFileUrl(undefined)).to.be.null
            expect(transformFileUrl(123)).to.be.null
            expect(transformFileUrl({})).to.be.null
            expect(transformFileUrl([])).to.be.null
        })
        it('returns the URL transformed', () => {
            expect(transformFileUrl('http://some-file.kml?one=1&foo=bar')).to.eq(
                `http/some-file.kml${encodeURIComponent('?one=1&foo=bar')}`
            )
        })
    })
})
