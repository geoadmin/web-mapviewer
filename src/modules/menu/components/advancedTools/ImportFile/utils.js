import KMLLayer from '@/api/layers/KMLLayer.class'

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
 * @param {string} [name=null] Name of the KML. Default is `null`
 * @returns {ExternalLayer} External layer object
 */
export function handleFileContent(store, content, source, name = null) {
    let layer = null
    if (isKml(content)) {
        layer = new KMLLayer(source, true, 1.0, null /* adminId */, name.trim() || 'KML', content)
        store.dispatch('addLayer', layer)
    } else if (isGpx(content)) {
        // TODO GPX layer not done yet
    } else {
        throw new Error(`Unsupported file ${source} content`)
    }
    return layer
}

/**
 * Validate KML|GPX name
 *
 * @param {string} name
 * @returns {string} Empty string if valid otherwise error message
 */
export function validateName(name) {
    if (name.length > 32) {
        return 'name_too_long'
    }
    return ''
}
