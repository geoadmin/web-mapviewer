import JSZip from 'jszip'
import GPX from 'ol/format/GPX'

import GPXLayer from '@/api/layers/GPXLayer.class.js'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { OutOfBoundsError } from '@/utils/coordinates/coordinateUtils'
import { getExtentForProjection } from '@/utils/extentUtils.js'
import { EmptyGPXError, getGpxExtent } from '@/utils/gpxUtils.js'
import { EmptyKMLError, getKmlExtent } from '@/utils/kmlUtils'
import KML from '@/utils/ol/format/KML'
import KMZ, { getKMLData, getKMLImage } from '@/utils/ol/format/KMZ'

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

function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target.result)
        reader.onerror = (error) => reject(error)
        reader.readAsArrayBuffer(file)
    })
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
export async function handleFileContent(store, content, source) {
    console.error('content: ', content)
    if (content.name && content.name.endsWith('.kmz')) {
        content = await readFileContent(content)
        content = getKMLData(content)
    }
    let images = getKMLImage(content)
    console.error(images)
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
        if (store.getters.getActiveLayersById(layer.id).length > 0) {
            store.dispatch('updateLayers', { layers: [layer], ...dispatcher })
        } else {
            store.dispatch('addLayer', { layer, ...dispatcher })
        }
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
