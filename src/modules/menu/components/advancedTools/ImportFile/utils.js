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
 * @param {string} content Content of the file
 * @param {string} source Source of the file (either URL or file path)
 * @returns
 */
export function handleFileContent(content, source) {
    let layer = null
    if (isKml(content)) {
        // TODO just for test
        layer = new KMLLayer(source, true, 1, null, null, null, null, true /* isExternal */)
    } else if (isGpx(content)) {
        // TODO GPX layer not done yet
    } else {
        throw new Error(`Unsupported file ${source} content`)
    }
    return layer
}
