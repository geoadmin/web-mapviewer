import i18n from '@/modules/i18n/index'
import { serializeAnchor } from '@/utils/featureAnchor'
import Feature from 'ol/Feature'
import { GPX, KML } from 'ol/format'
import { LineString, Polygon } from 'ol/geom'
import { Circle, Icon } from 'ol/style'
import Style from 'ol/style/Style'

const kmlFormat = new KML()
const gpxFormat = new GPX()

/**
 * Returns a string representing the features given in param as a GPX
 *
 * @param features {Feature[]} Features (OpenLayers) to be converted to GPX format
 * @param featureProjection {String} Projection used to describe the feature (default is EPSG:3857)
 * @returns {string}
 */
export function generateGpxString(features = [], featureProjection = 'EPSG:3857') {
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
        // The following serialization is a hack. See @module comment in file.
        serializeAnchor(clone)
        clone.set('type', clone.get('type').toLowerCase())
        clone.setId(f.getId())
        clone.getGeometry().setProperties(f.getGeometry().getProperties())
        clone.getGeometry().transform('EPSG:3857', 'EPSG:4326')
        let styles = styleFunction || clone.getStyleFunction()
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
        // Remove no image hack
        kmlString = kmlString.replace(/<Icon>\s*<href>noimage<\/href>\s*<\/Icon>/g, '')

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
