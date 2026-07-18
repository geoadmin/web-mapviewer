import { VectorTile } from '@mapbox/vector-tile'
import Pbf from 'pbf'

/**
 * Adapter for the PB-2246 version 2 publication.
 *
 * The producer validates the publication before exposure; this adapter gates version compatibility.
 * PBF decoding and `toGeoJSON` are transport work. They remain until the publication changes to a
 * format that Cesium can render as tiled text labels directly.
 */

const PUBLICATION_PATH = 'v2'
const VECTOR_LAYER_NAME = 'labels'

function getAvailableTiles(availability, layers) {
    return new Set(
        layers.flatMap((layer) =>
            availability.layers[layer.id].map((path) => `${layer.id}/${path}`)
        )
    )
}

function decodeFeature(feature, tile) {
    const { coordinates } = feature.toGeoJSON(tile.x, tile.y, tile.z).geometry
    const { text, type } = feature.properties
    const [lon, lat] = coordinates
    return { lon, lat, text, type }
}

function decodeFeatures(buffer, tile) {
    const layer = new VectorTile(new Pbf(buffer)).layers[VECTOR_LAYER_NAME]
    const features = []
    for (let index = 0; index < layer.length; index += 1) {
        features.push(decodeFeature(layer.feature(index), tile))
    }
    return features
}

/**
 * Creates the PB-2246 publication adapter used by the Swissnames renderer.
 *
 * @param {string} baseUrl 3D data base URL for the current environment
 * @param {string} layerId Swissnames layer ID
 * @param {typeof fetch} fetchData Fetch implementation
 * @returns {{ loadFeatures: Function; loadLayers: Function }}
 */
export function createSwissnamesLabelDataAdapter(baseUrl, layerId, fetchData = fetch) {
    const publicationUrl = `${baseUrl}${layerId}/${PUBLICATION_PATH}`
    const configUrl = `${publicationUrl}/mbtiles-layers.json`
    let publication = null

    async function loadLayers() {
        const response = await fetchData(configUrl)
        if (!response.ok) {
            throw new Error(`Swissnames labels config returned HTTP ${response.status}`)
        }
        const config = await response.json()
        if (config.version !== '2.0') {
            throw new TypeError('Invalid Swissnames labels config')
        }
        const nextTileBaseUrl = `${publicationUrl}${config.s3BaseUrl}`
        const availabilityResponse = await fetchData(
            `${nextTileBaseUrl}/${config.tileAvailability}`
        )
        if (!availabilityResponse.ok) {
            throw new Error(
                `Swissnames tile availability returned HTTP ${availabilityResponse.status}`
            )
        }
        const availableTiles = getAvailableTiles(await availabilityResponse.json(), config.layers)
        publication = { availableTiles, tileBaseUrl: nextTileBaseUrl }
        return config.layers
    }

    async function loadFeatures(layer, tile, signal) {
        const key = `${layer.id}/${tile.z}/${tile.x}/${tile.y}`
        // Each layer has one tileZoom, so availability paths only need x/y.
        if (!publication.availableTiles.has(`${layer.id}/${tile.x}/${tile.y}`)) {
            return []
        }
        const response = await fetchData(`${publication.tileBaseUrl}/${key}.pbf`, { signal })
        if (!response.ok) {
            throw new Error(`Swissnames tile ${key} returned HTTP ${response.status}`)
        }
        return decodeFeatures(await response.arrayBuffer(), tile)
    }

    return { loadFeatures, loadLayers }
}
