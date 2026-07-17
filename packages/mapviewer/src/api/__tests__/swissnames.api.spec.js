import { expect } from 'chai'
import { describe, it } from 'vitest'

import { createSwissnamesLabelDataAdapter } from '@/api/swissnames.api'

const BASE_URL = 'https://sys-3d.dev.bgdi.ch/'
const LAYER_ID = 'ch.swisstopo.swissnames3d.3d'
const TILE = { z: 9, x: 264, y: 181 }
const TILE_PBF =
    'Gjx4AgoGbGFiZWxzKIAgGgR0ZXh0GgR0eXBlIgUKA09SVCIJCgdHZW7DqHZlEg8YARIEAAEBACIFCZQvoi4='

async function getError(promise) {
    try {
        await promise
    } catch (error) {
        return error
    }
    throw new Error('Expected the promise to reject')
}

function jsonResponse(data) {
    return { ok: true, json: async () => data }
}

function pbfResponse(encodedTile = TILE_PBF) {
    const buffer = Uint8Array.from(atob(encodedTile), (character) => character.charCodeAt(0)).buffer
    return { arrayBuffer: async () => buffer, ok: true }
}

function manifest(layer = {}) {
    return {
        version: '2.0',
        s3BaseUrl: '/20260716',
        tileAvailability: 'availability.json',
        layers: [
            {
                id: 'zoomlevel0',
                fontSize: 18,
                maxAlt: null,
                maxDistance: 500000,
                minAlt: 0,
                tileZoom: 9,
                ...layer,
            },
        ],
    }
}

function availability(paths = ['264/181']) {
    return { layers: { zoomlevel0: paths } }
}

describe('Swissnames label data adapter', () => {
    it('loads the version 2 manifest and exact tile availability', async () => {
        const requests = []
        const responses = [jsonResponse(manifest()), jsonResponse(availability())]
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, async (url) => {
            requests.push(url)
            return responses.shift()
        })

        expect(await adapter.loadLayers()).to.deep.equal([
            {
                id: 'zoomlevel0',
                fontSize: 18,
                maxAlt: null,
                maxDistance: 500000,
                minAlt: 0,
                tileZoom: 9,
            },
        ])
        expect(requests).to.deep.equal([
            `${BASE_URL}${LAYER_ID}/v2/mbtiles-layers.json`,
            `${BASE_URL}${LAYER_ID}/v2/20260716/availability.json`,
        ])
    })

    it('skips unavailable tiles and decodes the canonical tile contract', async () => {
        const requests = []
        const responses = [jsonResponse(manifest()), jsonResponse(availability()), pbfResponse()]
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, async (url) => {
            requests.push(url)
            return responses.shift()
        })
        const [layer] = await adapter.loadLayers()

        expect(await adapter.loadFeatures(layer, { z: 9, x: 265, y: 181 })).to.deep.equal([])
        const [feature] = await adapter.loadFeatures(layer, TILE)

        expect(feature.text).to.equal(String.fromCodePoint(0x47, 0x65, 0x6e, 0xe8, 0x76, 0x65))
        expect(feature.type).to.equal('ORT')
        expect(feature.lon).to.be.closeTo(6.143074, 0.000001)
        expect(feature.lat).to.be.closeTo(46.20823, 0.000001)
    })

    it('reports manifest HTTP failures', async () => {
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, async () => ({
            ok: false,
            status: 503,
        }))

        const error = await getError(adapter.loadLayers())

        expect(error.message).to.equal('Swissnames labels config returned HTTP 503')
    })

    it('rejects publications with a different contract version', async () => {
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, async () =>
            jsonResponse({ ...manifest(), version: '3.0' })
        )

        const error = await getError(adapter.loadLayers())

        expect(error.message).to.equal('Invalid Swissnames labels config')
    })

    it('rejects incomplete version 2 layers', async () => {
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, async () =>
            jsonResponse(manifest({ maxDistance: undefined }))
        )

        const error = await getError(adapter.loadLayers())

        expect(error).to.be.instanceOf(TypeError)
        expect(error.message).to.equal('Invalid Swissnames label maxDistance')
    })

    it.each(['fontSize', 'maxDistance'])('rejects non-positive %s', async (fieldName) => {
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, async () =>
            jsonResponse(manifest({ [fieldName]: 0 }))
        )

        const error = await getError(adapter.loadLayers())

        expect(error.message).to.equal(`Invalid Swissnames label ${fieldName}`)
    })

    it('reports availability HTTP failures', async () => {
        const responses = [jsonResponse(manifest()), { ok: false, status: 503 }]
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, async () =>
            responses.shift()
        )

        const error = await getError(adapter.loadLayers())

        expect(error.message).to.equal('Swissnames tile availability returned HTTP 503')
    })

    it('does not expose partially loaded config after invalid availability', async () => {
        const responses = [jsonResponse(manifest()), jsonResponse({ layers: {} })]
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, async () =>
            responses.shift()
        )

        await getError(adapter.loadLayers())
        const error = await getError(adapter.loadFeatures({ id: 'zoomlevel0' }, TILE))

        expect(error.message).to.equal('Swissnames labels config must be loaded before its tiles')
    })

    it('reports listed tile HTTP failures', async () => {
        const responses = [
            jsonResponse(manifest()),
            jsonResponse(availability()),
            { ok: false, status: 503 },
        ]
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, async () =>
            responses.shift()
        )
        const [layer] = await adapter.loadLayers()

        const error = await getError(adapter.loadFeatures(layer, TILE))

        expect(error.message).to.equal('Swissnames tile zoomlevel0/9/264/181 returned HTTP 503')
    })

    it('forwards tile request cancellation', async () => {
        const requests = []
        const responses = [jsonResponse(manifest()), jsonResponse(availability()), pbfResponse()]
        const adapter = createSwissnamesLabelDataAdapter(
            BASE_URL,
            LAYER_ID,
            async (url, options = {}) => {
                requests.push({ url, options })
                return responses.shift()
            }
        )
        const [layer] = await adapter.loadLayers()
        const abortController = new AbortController()

        await adapter.loadFeatures(layer, TILE, abortController.signal)

        expect(requests[2].options.signal).to.equal(abortController.signal)
    })
})
