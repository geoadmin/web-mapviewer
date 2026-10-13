import { describe, expect, it } from 'vitest'

import { isBaseUrlOverrideAllowed } from '../BaseUrlOverrideParamConfig.class'

const services = ['wms', 'wmts', 'api3']

describe('isBaseUrlOverrideAllowed', () => {
    services.forEach((service) => {
        const devUrl = `https://sys-${service}.dev.bgdi.ch`
        const intUrl = `https://sys-${service}.int.bgdi.ch`

        it(`allows a PR preview link as override for ${service}`, () => {
            expect(
                isBaseUrlOverrideAllowed(`${devUrl}/some-pr-path`),
                'DEV PR preview link was not allowed'
            ).toBe(true)
            expect(
                isBaseUrlOverrideAllowed(`${intUrl}/some-pr-path`),
                'INT PR preview link was not allowed'
            ).toBe(true)
        })

        it(`allows the use of the DEV or INT staging as override for ${service}`, () => {
            expect(isBaseUrlOverrideAllowed(devUrl)).toBe(true)
            expect(isBaseUrlOverrideAllowed(intUrl)).toBe(true)
        })
    })

    it('allows the use of localhost URLs as override', () => {
        expect(isBaseUrlOverrideAllowed('http://localhost')).toBe(true)
        expect(isBaseUrlOverrideAllowed('http://localhost:1234')).toBe(true)
        expect(isBaseUrlOverrideAllowed('http://localhost:5678/some-path')).toBe(true)
    })

    it('should return false for a URL not matching either allowed pattern', () => {
        expect(isBaseUrlOverrideAllowed('https://unallowed.example.com')).toBe(false)
        expect(isBaseUrlOverrideAllowed('https://sys-wrongservice.dev.bgdi.ch')).toBe(false)
    })

    it('should return false for an invalid URL', () => {
        expect(isBaseUrlOverrideAllowed('not-a-valid-url')).toBe(false)
    })
})
