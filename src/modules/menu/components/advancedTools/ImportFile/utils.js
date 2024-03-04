import GPXLayer from '@/api/layers/GPXLayer.class.js'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { OutOfBoundsError } from '@/utils/coordinates/coordinateUtils'
import { getExtentForProjection } from '@/utils/extentUtils.js'
import GPX from '@/utils/GPX'
import { EmptyGPXError, getGpxExtent } from '@/utils/gpxUtils.js'
import { EmptyKMLError, getKmlExtent } from '@/utils/kmlUtils'

const dispatcher = { dispatcher: 'ImportFile/utils' }

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
        layer = new KMLLayer({
            kmlFileUrl: source,
            visible: true,
            opacity: 1.0,
            adminId: null,
            kmlData: content,
        })
        const extent = getKmlExtent(content)
        if (!extent) {
            throw new EmptyKMLError()
        }
        const projectedExtent = getExtentForProjection(store.state.position.projection, extent)

        if (!projectedExtent) {
            throw new OutOfBoundsError(`KML out of projection bounds: ${extent}`)
        }
        store.dispatch('zoomToExtent', { extent: projectedExtent, ...dispatcher })
        store.dispatch('addLayer', { layer, ...dispatcher })
    } else if (isGpx(content)) {
        const gpxParser = new GPX()
        const metadata = gpxParser.readMetadata(content)
        layer = new GPXLayer({
            gpxFileUrl: source,
            visible: true,
            opacity: 1.0,
            gpxData: content,
            gpxMetadata: metadata,
        })
        const extent = getGpxExtent(content)
        if (!extent) {
            throw new EmptyGPXError()
        }
        const projectedExtent = getExtentForProjection(store.state.position.projection, extent)
        if (!projectedExtent) {
            throw new OutOfBoundsError(`GPX out of projection bounds: ${extent}`)
        }
        store.dispatch('zoomToExtent', { extent: projectedExtent, ...dispatcher })
        store.dispatch('addLayer', { layer, ...dispatcher })
    } else {
        throw new Error(`Unsupported file ${source} content`)
    }
    return layer
}
