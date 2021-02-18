import { expect } from 'chai'
import { WMTSLayer, TimeConfig } from '@/api/layers.api'

describe('Test WMTSLayer class', () => {
    it('returns all possible URL with getURLs when provided with a {0-9} notation baseURL', () => {
        const name = 'name'
        const id = 'id'
        const urls = new WMTSLayer(
            name,
            id,
            1.0,
            'png',
            new TimeConfig(),
            false,
            'https://test{0-4}.admin.ch'
        ).getURLs()

        // generating expected results
        const expected = []
        for (let i = 0; i < 4; i += 1) {
            expected.push(
                `https://test${i}.admin.ch/1.0.0/${id}/default/current/3857/{z}/{x}/{y}.png`
            )
        }
        expect(urls).to.include.members(expected)
    })
})
