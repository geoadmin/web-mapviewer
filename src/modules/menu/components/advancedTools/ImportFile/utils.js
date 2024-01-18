import KMLLayer from '@/api/layers/KMLLayer.class'
import { OutOfBoundsError } from '@/utils/coordinates/coordinateUtils'
import { EmptyKMLError, getKmlExtent, getKmlExtentForProjection } from '@/utils/kmlUtils'

/**
 * Checks if file is KML
 *
 * @param {string} fileContent
 * @returns {boolean}
 */
export function isKml(fileContent) {
    return /<kml/.test(fileContent) && /<\/kml\s*>/.test(fileContent)
}

/**
 * Checks if file is GPX
 *
 * @param {string} fileContent
 * @returns {boolean}
 */
export function isGpx(fileContent) {
    return /<gpx/.test(fileContent) && /<\/gpx\s*>/.test(fileContent)
}

/**
 * Handle file content
 *
 * @param {OBject} store Vuex store
 * @param {string} content Content of the file
 * @param {string} source Source of the file (either URL or file path)
 * @returns {ExternalLayer} External layer object
 */
export function handleFileContent(store, content, source) {
    let layer = null
    if (isKml(content)) {
        layer = new KMLLayer(source, true, 1.0, null /* adminId */, content)
        const extent = getKmlExtent(content)
        if (!extent) {
            throw new EmptyKMLError()
        }
        const projectedExtent = getKmlExtentForProjection(store.state.position.projection, extent)

        if (!projectedExtent) {
            throw new OutOfBoundsError(`KML out of projection bounds: ${extent}`)
        }
        store.dispatch('zoomToExtent', projectedExtent)
        store.dispatch('addLayer', layer)
    } else if (isGpx(content)) {
        // TODO GPX layer not done yet
    } else {
        throw new Error(`Unsupported file ${source} content`)
    }
    return layer
}
