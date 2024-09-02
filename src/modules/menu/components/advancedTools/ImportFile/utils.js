import GPX from 'ol/format/GPX'

import GPXLayer from '@/api/layers/GPXLayer.class.js'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { OutOfBoundsError } from '@/utils/coordinates/coordinateUtils'
import { getExtentForProjection } from '@/utils/extentUtils.js'
import { EmptyGPXError, getGpxExtent } from '@/utils/gpxUtils.js'
import { EmptyKMLError, getKmlExtent } from '@/utils/kmlUtils'
import KMZ from '@/utils/ol/format/KMZ'

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
 * Transform file to arraybuffer to synchronously deal with the zipped kml and icons
 *
 * @param {string} fileContent
 * @returns {ArrayBuffer}
 */
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
    let iconUrlFunction = null
    if (content.name && content.name.endsWith('.kmz')) {
        content = await readFileContent(content)
        const kmz = new KMZ({})
        kmz.readFeatures(content, {
            dataProjection: WGS84.epsg, // KML files should always be in WGS84
            featureProjection: WGS84.epsg,
        })
        content = kmz.kmlData
        iconUrlFunction = kmz.iconUrlFunction
    }
    console.error('SPAMSPAMSPAM:', iconUrlFunction)
    let layer = null
    if (isKml(content) || iconUrlFunction) {
        layer = new KMLLayer({
            kmlFileUrl: source,
            visible: true,
            opacity: 1.0,
            adminId: null,
            kmlData: content,
            iconUrlFunction: iconUrlFunction,
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
