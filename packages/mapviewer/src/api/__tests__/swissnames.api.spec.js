import { expect } from 'chai'
import { describe, it } from 'vitest'

import { createSwissnamesLabelDataAdapter } from '@/api/swissnames.api'

const BASE_URL = 'https://sys-3d.dev.bgdi.ch/'
const LAYER_ID = 'ch.swisstopo.swissnames3d.3d'

async function getError(promise) {
    try {
        await promise
    } catch (error) {
        return error
    }
    throw new Error('Expected the promise to reject')
}

function jsonResponse(data) {
    return {
        ok: true,
        json: async () => data,
    }
}

describe('Swissnames label data adapter', () => {
    it('fetches and normalizes the prototype manifest', async () => {
        const requests = []
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, `/${LAYER_ID}/`, async (url) => {
            requests.push(url)
            return jsonResponse({
                version: '1.0',
                s3BaseUrl: '/20260320',
                layers: [
                    { file: 'zoomlevel0', zoom: 9, minAlt: 100, maxAlt: null },
                    { file: 'zoomlevel1', zoom: 10 },
                ],
            })
        })

        const config = await adapter.loadConfig()

        expect(requests).to.deep.equal([`${BASE_URL}${LAYER_ID}/v1/mbtiles-layers.json`])
        expect(adapter.configBaseUrl).to.equal(`${BASE_URL}${LAYER_ID}/v1`)
        expect(config.version).to.equal('1.0')
        expect(config.s3BaseUrl).to.equal('/20260320')
        expect(config.layers[0].maxAlt).to.equal(Infinity)
        expect(config.layers[0].minAlt).to.equal(100)
        expect(config.layers[0].fontSize).to.equal(13)
        expect(config.layers[1].minAlt).to.equal(0)
    })

    it('rejects invalid manifest layers', async () => {
        const invalidZoomAdapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, async () =>
            jsonResponse({ layers: [{ file: 'zoomlevel0', zoom: 9.5 }] })
        )
        const invalidAltitudeAdapter = createSwissnamesLabelDataAdapter(
            BASE_URL,
            LAYER_ID,
            async () =>
                jsonResponse({
                    layers: [{ file: 'zoomlevel0', zoom: 9, minAlt: Number.NaN }],
                })
        )

        expect((await getError(invalidZoomAdapter.loadConfig())).message).to.equal(
            'Invalid Swissnames label zoom'
        )
        expect((await getError(invalidAltitudeAdapter.loadConfig())).message).to.equal(
            'Invalid Swissnames label minAlt'
        )
    })

    it('reports manifest HTTP failures', async () => {
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, async () => ({
            ok: false,
            status: 503,
        }))

        expect((await getError(adapter.loadConfig())).message).to.equal(
            'Swissnames labels config returned HTTP 503'
        )
    })
})
