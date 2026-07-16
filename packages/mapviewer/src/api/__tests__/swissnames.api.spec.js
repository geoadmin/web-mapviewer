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

function pbfResponse(encodedTile) {
    const buffer = Uint8Array.from(atob(encodedTile), (character) => character.charCodeAt(0)).buffer
    return { arrayBuffer: async () => buffer, ok: true }
}

describe('Swissnames label data adapter', () => {
    it('fetches and normalizes the prototype manifest', async () => {
        const requests = []
        const fetchData = async (url) => {
            requests.push(url)
            return jsonResponse({
                s3BaseUrl: '/20260320',
                layers: [
                    {
                        file: 'zoomlevel0',
                        fontSize: 18,
                        maxAlt: null,
                        minAlt: 0,
                        zoom: 9,
                    },
                ],
            })
        }
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, fetchData)

        expect(await adapter.loadLayers()).to.deep.equal([
            {
                id: 'zoomlevel0',
                fontSize: 18,
                maxAlt: Infinity,
                minAlt: 0,
                tileZoom: 9,
            },
        ])
        expect(requests).to.deep.equal([`${BASE_URL}${LAYER_ID}/v1/mbtiles-layers.json`])
    })

    it('reports manifest HTTP failures', async () => {
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, async () => ({
            ok: false,
            status: 503,
        }))

        const error = await getError(adapter.loadLayers())

        expect(error.message).to.equal('Swissnames labels config returned HTTP 503')
    })

    it('rejects incomplete manifest layers', async () => {
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, async () =>
            jsonResponse({
                s3BaseUrl: '/20260320',
                layers: [{ file: 'zoomlevel0', fontSize: 18, maxAlt: null, zoom: 9 }],
            })
        )

        const error = await getError(adapter.loadLayers())

        expect(error).to.be.instanceOf(TypeError)
        expect(error.message).to.equal('Invalid Swissnames label minAlt')
    })

    it('owns tile URLs and remembers sparse tiles for the adapter lifetime', async () => {
        const requests = []
        const tileStatuses = [403, 503]
        const fetchData = async (url) => {
            requests.push(url)
            if (requests.length === 1) {
                return jsonResponse({
                    s3BaseUrl: '/20260320',
                    layers: [
                        {
                            file: 'zoomlevel4',
                            fontSize: 13,
                            maxAlt: 150000,
                            minAlt: 0,
                            zoom: 11,
                        },
                    ],
                })
            }
            return { ok: false, status: tileStatuses.shift() }
        }
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, fetchData)
        const [layer] = await adapter.loadLayers()

        const sparseTile = { z: 11, x: 1071, y: 724 }
        const features = await adapter.loadFeatures(layer, sparseTile)

        expect(requests[1]).to.equal(
            `${BASE_URL}${LAYER_ID}/v1/20260320/zoomlevel4/11/1071/724.pbf`
        )
        expect(features).to.deep.equal([])
        expect(await adapter.loadFeatures(layer, sparseTile)).to.deep.equal([])
        expect(requests).to.have.length(2)

        const error = await getError(adapter.loadFeatures(layer, { z: 11, x: 1072, y: 724 }))
        expect(error.message).to.equal('Swissnames tile zoomlevel4/11/1072/724 returned HTTP 503')
    })
    it('decodes the producer PBF contract and forwards request cancellation', async () => {
        const tileBuffer = Uint8Array.from(
            atob(
                'Gkh4AgoGbGFiZWxzKIAgGgROYW1lGgRUWVBFIggKBkdJUEZFTCISChBHcm9zcyBNdXR0ZW5ob3JuEg8YARIEAAEBACIFCZ48wgY='
            ),
            (character) => character.charCodeAt(0)
        ).buffer
        const requests = []
        const fetchData = async (url, options = {}) => {
            requests.push({ url, options })
            if (requests.length === 1) {
                return jsonResponse({
                    s3BaseUrl: '/20260320',
                    layers: [
                        {
                            file: 'zoomlevel4',
                            fontSize: 13,
                            maxAlt: 150000,
                            minAlt: 0,
                            zoom: 11,
                        },
                    ],
                })
            }
            return {
                arrayBuffer: async () => tileBuffer,
                ok: true,
            }
        }
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, fetchData)
        const [layer] = await adapter.loadLayers()
        const abortController = new AbortController()

        const [feature] = await adapter.loadFeatures(
            layer,
            { z: 11, x: 1071, y: 724 },
            abortController.signal
        )

        expect(requests[1].options.signal).to.equal(abortController.signal)
        expect(feature.text).to.equal('Gross Muttenhorn')
        expect(feature.type).to.equal('GIPFEL')
        expect(feature.lon).to.be.closeTo(8.427157, 0.000001)
        expect(feature.lat).to.be.closeTo(46.546554, 0.000001)
    })
    it('filters point labels buffered into adjacent tiles', async () => {
        const responses = [
            jsonResponse({
                s3BaseUrl: '/20260320',
                layers: [
                    {
                        file: 'zoomlevel4',
                        fontSize: 13,
                        maxAlt: 150000,
                        minAlt: 0,
                        zoom: 11,
                    },
                ],
            }),
            pbfResponse(
                'Gmd4AgoGbGFiZWxzKIAgGgROYW1lGgRUWVBFIgUKA09SVCILCglVbnRlcnNlZW4iFgoUTWF0dGVuIGIuIEludGVybGFrZW4SDxgBEgQAAQEAIgUJ4ifOPRIPGAESBAACAQAiBQmWMMRA'
            ),
            pbfResponse(
                'GnF4AgoGbGFiZWxzKIAgGgROYW1lGgRUWVBFIgUKA09SVCIICgZHSVBGRUwiDAoKU2Nod2FsbWVyZSIWChRNYXR0ZW4gYi4gSW50ZXJsYWtlbhIPGAESBAACAQEiBQn+HfwtEg4YARIEAAMBACIECZYwRA=='
            ),
        ]
        const adapter = createSwissnamesLabelDataAdapter(BASE_URL, LAYER_ID, async () =>
            responses.shift()
        )
        const [layer] = await adapter.loadLayers()

        const bufferedTileFeatures = await adapter.loadFeatures(layer, {
            z: 11,
            x: 1068,
            y: 722,
        })
        const owningTileFeatures = await adapter.loadFeatures(layer, { z: 11, x: 1068, y: 723 })

        const mattenLabels = [...bufferedTileFeatures, ...owningTileFeatures].filter(
            (feature) => feature.text === 'Matten b. Interlaken'
        )

        expect(bufferedTileFeatures.map(({ text }) => text)).to.not.include('Matten b. Interlaken')
        expect(owningTileFeatures.map(({ text }) => text)).to.include('Matten b. Interlaken')
        expect(mattenLabels).to.have.length(1)
    })
})
