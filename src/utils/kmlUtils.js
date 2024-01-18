import KML from 'ol/format/KML'

/**
 * Read the KML name
 *
 * @param {string} content Kml content
 * @returns {string} Return KML name
 */
export function parseKmlName(content) {
    const kml = new KML()

    return kml.readName(content)
}

/**
 * Update a KML Active Layer
 *
 * @param {Store} store
 * @param {KMLLayer} kmlLayer KML Layer object to update
 * @param {string | null} data KML data as string
 * @param {JSON | null} metadata KML metadata as JSON (only for geoadmin KML)
 */
export async function updateKmlActiveLayer(store, kmlLayer, data = null, metadata = null) {
    if (data || metadata) {
        const updateObj = { id: kmlLayer.getID() }
        if (data) {
            updateObj.kmlData = data
            updateObj.name = parseKmlName(data)
            updateObj.isLoading = false
        }
        if (metadata) {
            updateObj.kmlMetadata = metadata
        }
        await store.dispatch('updateLayer', updateObj)
    }
}
