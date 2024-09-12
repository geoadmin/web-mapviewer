import GPX from 'ol/format/GPX'

import GPXLayer from '@/api/layers/GPXLayer.class.js'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { OutOfBoundsError } from '@/utils/coordinates/coordinateUtils'
import { getExtentForProjection } from '@/utils/extentUtils.js'
import { EmptyGPXError, getGpxExtent } from '@/utils/gpxUtils.js'
import { EmptyKMLError, getKmlExtent, unzipKmz } from '@/utils/kmlUtils'
import log from '@/utils/logging'
import { isZipContent } from '@/utils/utils'

const dispatcher = { dispatcher: 'ImportFile/utils' }

/**
 * Checks if file is KML
 *
 * @param {string} fileContent
 * @returns {boolean}
 */
export function isKml(fileContent) {
    return /^\s*(<\?xml\b[^>]*\?>)?\s*(<!--(.*?)-->\s*)*<(kml:)?kml\b[^>]*>[\s\S.]*<\/(kml:)?kml\s*>/g.test(
        fileContent
    )
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
 * @param {ArrayBuffer} content Content of the file
 * @param {string} source Source of the file (either URL or file path)
 * @returns {ExternalLayer} External layer object
 */
export async function handleFileContent(store, content, source) {
    let layer = null
    let textContent
    if (isZipContent(content)) {
        log.debug(`File content is a zipfile, assume it is a KMZ archive`)
        const kmz = await unzipKmz(content, source)
        textContent = kmz.kml
    } else {
        // If it is not a zip file then we assume is a text file and decode it for further handling
        textContent = new TextDecoder('utf-8').decode(content)
    }
    if (isKml(textContent)) {
        layer = new KMLLayer({
            kmlFileUrl: source,
            visible: true,
            opacity: 1.0,
            adminId: null,
            kmlData: textContent,
        })
        const extent = getKmlExtent(textContent)
        if (!extent) {
            throw new EmptyKMLError()
        }
        const projectedExtent = getExtentForProjection(store.state.position.projection, extent)

        if (!projectedExtent) {
            throw new OutOfBoundsError(`KML out of projection bounds: ${extent}`)
        }
        store.dispatch('zoomToExtent', { extent: projectedExtent, ...dispatcher })
        if (store.getters.getActiveLayersById(layer.id).length > 0) {
            store.dispatch('updateLayers', { layers: [layer], ...dispatcher })
        } else {
            store.dispatch('addLayer', { layer, ...dispatcher })
        }
    } else if (isGpx(textContent)) {
        const gpxParser = new GPX()
        const metadata = gpxParser.readMetadata(textContent)
        layer = new GPXLayer({
            gpxFileUrl: source,
            visible: true,
            opacity: 1.0,
            gpxData: textContent,
            gpxMetadata: metadata,
        })
        const extent = getGpxExtent(textContent)
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
        throw new Error(`Unsupported file ${source} textContent`)
    }

    return layer
}
