import { describe, expect, it } from 'vitest'

import fileProxyAPI from '@/fileProxy'

describe('Serice-proxy tests', () => {
    describe('transformFileUrl', () => {
        it('returns undefined when the input is invalid', () => {
            expect(fileProxyAPI.transformFileUrl('some non URL string')).to.be.undefined
        })
        it('returns the URL transformed', () => {
            expect(fileProxyAPI.transformFileUrl('http://some-file.kml?one=1&foo=bar')).to.eq(
                `http/some-file.kml${encodeURIComponent('?one=1&foo=bar')}`
            )
        })
    })
})
