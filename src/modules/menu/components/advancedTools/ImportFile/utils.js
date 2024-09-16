import { fromArrayBuffer, GeoTIFF } from 'geotiff'
import GPX from 'ol/format/GPX'

import GeoTIFFLayer from '@/api/layers/GeoTIFFLayer.class'
import GPXLayer from '@/api/layers/GPXLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { normalizeExtent, OutOfBoundsError } from '@/utils/coordinates/coordinateUtils'
import { getExtentForProjection } from '@/utils/extentUtils'
import { EmptyGPXError, getGpxExtent } from '@/utils/gpxUtils'
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
 * @param {File | null} [originalFile]
 * @returns {ExternalLayer} External layer object
 */
export async function handleFileContent(store, content, source, originalFile = null) {
    let layer = null
    let parsedContent
    let linkFiles
    if (isZipContent(content)) {
        log.debug(`File content is a zipfile, assume it is a KMZ archive`)
        const kmz = await unzipKmz(content, source)
        parsedContent = kmz.kml
        linkFiles = kmz.files
    } else if (source.endsWith('.tif')) {
        log.debug(`File content might be a COGTIFF, attempting a parse as such`)
        try {
            parsedContent = await fromArrayBuffer(content)
        } catch (err) {
            log.debug('parsing as COGTIFF failed, moving on with other formats', err)
        }
    } else {
        // If it is not a zip file then we assume is a text file and decode it for further handling
        parsedContent = new TextDecoder('utf-8').decode(content)
    }
    if (parsedContent instanceof GeoTIFF) {
        layer = new GeoTIFFLayer({
            fileSource: source,
            visible: true,
            opacity: 1.0,
            // For local files : OpenLayers needs a Blob, and not an already parsed GeoTIFF instance
            data: originalFile,
        })
        store.dispatch('addLayer', { layer, ...dispatcher })
        // looking into the GeoTIFF file to get the extento
        const geoTIFFImage = await parsedContent.getImage()
        const geoTIFFExtent = geoTIFFImage.getBoundingBox()
        if (geoTIFFExtent) {
            store.dispatch('zoomToExtent', {
                extent: normalizeExtent(geoTIFFExtent),
                ...dispatcher,
            })
        }
    } else if (isKml(parsedContent)) {
        layer = new KMLLayer({
            kmlFileUrl: source,
            visible: true,
            opacity: 1.0,
            adminId: null,
            kmlData: parsedContent,
            linkFiles,
        })
        const extent = getKmlExtent(parsedContent)
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
    } else if (isGpx(parsedContent)) {
        const gpxParser = new GPX()
        const metadata = gpxParser.readMetadata(parsedContent)
        layer = new GPXLayer({
            gpxFileUrl: source,
            visible: true,
            opacity: 1.0,
            gpxData: parsedContent,
            gpxMetadata: metadata,
        })
        const extent = getGpxExtent(parsedContent)
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
