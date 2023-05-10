import { featureStyleFunction } from '@/modules/drawing/lib/style'
import i18n from '@/modules/i18n/index'
import { WEBMERCATOR, WGS84 } from '@/utils/coordinateSystems'
import Feature from 'ol/Feature'
import { GPX, KML } from 'ol/format'
import { LineString, Polygon } from 'ol/geom'
import { Circle, Icon } from 'ol/style'
import Style from 'ol/style/Style'

const kmlFormat = new KML()
const gpxFormat = new GPX()

/**
 * Enum that lists all possible saving statuses.
 *
 * @enum
 */
export const DrawingState = Object.freeze({
    // First state when entering the drawing mode
    INITIAL: 0,
    // Drawing has been loaded
    LOADED: 1,
    // Pending changes -> drawing has been modified and is not saved
    UNSAVED_CHANGES: 2,
    // Drawing is being saved
    SAVING: 3,
    // Drawing has been saved and no pending changes are remaining
    SAVED: 4,
    // ------------------------------------------------------------------------
    // ERROR states should always be negative !
    // Could not save drawing
    SAVE_ERROR: -1,
    // Could not load drawing
    LOAD_ERROR: -2,
})

/**
 * Returns a string representing the features given in param as a GPX
 *
 * @param features {Feature[]} Features (OpenLayers) to be converted to GPX format
 * @param featureProjection {String} Projection used to describe the feature (default is EPSG:3857)
 * @returns {string}
 */
export function generateGpxString(features = [], featureProjection = WEBMERCATOR.epsg) {
    const normalizedFeatures = features.map((feature) => {
        const clone = feature.clone()
        const geom = clone.getGeometry()
        // convert polygon to line because gpx doesn't support polygons
        if (geom instanceof Polygon) {
            const coordinates = geom.getLinearRing().getCoordinates()
            clone.setGeometry(new LineString(coordinates))
        }
        return clone
    })
    return gpxFormat.writeFeatures(normalizedFeatures, {
        featureProjection,
    })
}

/**
 * Returns a string representing the features given in param as a KML
 *
 * @param features {Feature[]} Features (OpenLayers) to be converted to KML format
 * @param styleFunction
 * @returns {string}
 */
export function generateKmlString(features = [], styleFunction = null) {
    let kmlString = '<kml></kml>'
    let exportFeatures = []
    features.forEach((f) => {
        const clone = f.clone()
        clone.setId(f.getId())
        clone.getGeometry().setProperties(f.getGeometry().getProperties())
        clone.getGeometry().transform(WEBMERCATOR.epsg, WGS84.epsg)
        let styles = styleFunction || featureStyleFunction
        styles = styles(clone)
        const newStyle = {
            fill: styles[0].getFill(),
            stroke: styles[0].getStroke(),
            text: styles[0].getText(),
            image: styles[0].getImage(),
            zIndex: styles[0].getZIndex(),
        }
        if (newStyle.image instanceof Circle) {
            newStyle.image = null
        }

        // If only text is displayed we must specify an image style with scale=0
        if (newStyle.text && !newStyle.image) {
            newStyle.image = new Icon({
                src: 'noimage',
                scale: 0,
            })
        }

        const myStyle = new Style(newStyle)
        clone.setStyle(myStyle)
        exportFeatures.push(clone)
    })

    if (exportFeatures.length > 0) {
        if (exportFeatures.length === 1) {
            // force the add of a <Document> node
            exportFeatures.push(new Feature())
        }
        kmlString = kmlFormat.writeFeatures(exportFeatures)
        /* Remove no image hack. An empty icon tag is needed by Openlayers to not show an icon
        with the default style. "<scale>0</scale>" may also be needed by other implementations. */
        kmlString = kmlString.replace(/<Icon>\s*<href>noimage<\/href>\s*<\/Icon>/g, '<Icon></Icon>')

        // Remove empty placemark added to have <Document> tag
        kmlString = kmlString.replace(/<Placemark\/>/g, '')

        kmlString = kmlString.replace(
            /<Document>/,
            `<Document><name>${i18n.global.t('draw_layer_label')}</name>`
        )
    }
    return kmlString
}

export function generateFilename(fileExtension) {
    fileExtension = fileExtension.replace(/^\./, '')
    const date = new Date()
        .toISOString()
        .split('.')[0]
        .replaceAll('-', '')
        .replaceAll(':', '')
        .replace('T', '')
    return `map.geo.admin.ch_${fileExtension.toUpperCase()}_${date}.${fileExtension.toLowerCase()}`
}
