import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { Geometry } from 'ol/geom'

import { WGS84 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import Feature from 'ol/Feature'
import GPX from 'ol/format/GPX'
import KML from 'ol/format/KML'
import { LineString as OLLineString, Polygon as OLPolygon } from 'ol/geom'
import { Circle as CircleStyle, Icon as IconStyle } from 'ol/style'
import Style from 'ol/style/Style'

import i18n from '@/modules/i18n/index'
import { geoadminStyleFunction } from '@/utils/featureStyleUtils'
import { EMPTY_KML_DATA } from '@/utils/kmlUtils'

const kmlFormat = new KML()

const gpxFormat = new GPX()

/**
 * Returns a string representing the features given in param as a GPX
 *
 * @param projection Coordinate system of the features
 * @param features Features (OpenLayers) to be converted to GPX format
 * @returns GPX string
 */
export function generateGpxString(
    projection: CoordinateSystem,
    features: Feature<Geometry>[] = []
): string {
    const normalizedFeatures = features.map((feature) => {
        const clone = feature.clone()
        const geom = clone.getGeometry()

        // convert polygon to line because GPX doesn't support polygons
        if (geom instanceof OLPolygon) {
            // Take the exterior ring coordinates
            const coordinates = geom.getLinearRing(0)?.getCoordinates()
            clone.setGeometry(new OLLineString(coordinates ?? []))
        }

        // Set the desc attribute from description property so that it is exported to GPX in desc tag
        const { description } = clone.getProperties() as { description?: string }
        if (description) {
            clone.set('desc', description)
        }
        return clone
    })
    return gpxFormat.writeFeatures(normalizedFeatures, {
        dataProjection: WGS84.epsg,
        featureProjection: projection.epsg,
    })
}

/**
 * Returns a string representing the features given in param as a KML
 *
 * @param projection Coordinate system of the features
 * @param features Features (OpenLayers) to be converted to KML format
 * @param fileName Name of the file
 * @returns KML string
 */
export function generateKmlString(
    projection: CoordinateSystem,
    features: Feature<Geometry>[] = [],
    fileName?: string
): string {
    log.debug(`Generate KML for ${features.length} features`)
    if (!projection) {
        log.error('Cannot generate KML string without projection')
        return ''
    }
    let kmlString = EMPTY_KML_DATA
    const exportFeatures: Feature<Geometry>[] = []

    features.forEach((f) => {
        const clone = f.clone()
        clone.setId(f.getId())

        // Keep original geometry properties
        const geom = clone.getGeometry()
        const srcGeom = f.getGeometry()
        if (geom && srcGeom) {
            // Geometry inherits from BaseObject, setProperties exists
            geom.setProperties(srcGeom.getProperties())
        }

        // Apply style compatible with KML export
        const styles = geoadminStyleFunction(clone) as Style[]
        if (!styles || styles.length === 0) {
            log.warn('Feature has no style, cannot export to KML')
            return
        }
        const style0 = styles[0]!
        const newStyle = {
            fill: style0.getFill() ?? undefined,
            stroke: style0.getStroke() ?? undefined,
            text: style0.getText() ?? undefined,
            image: style0.getImage() ?? undefined,
            zIndex: style0.getZIndex(),
        }

        // Remove circle image (not supported in KML export)
        if (newStyle.image instanceof CircleStyle) {
            newStyle.image = undefined
        }

        // If only text is displayed we must specify an image style with scale=0
        if (newStyle.text && !newStyle.image) {
            newStyle.image = new IconStyle({
                src: 'noimage',
                scale: 0,
            })
        }

        const styleForExport = new Style(newStyle)
        clone.setStyle(styleForExport)

        // We need to remove the editableFeature as we don't want it in extended data
        clone.unset('editableFeature')
        clone.unset('geodesic')

        exportFeatures.push(clone)
    })

    if (exportFeatures.length > 0) {
        if (exportFeatures.length === 1) {
            // force the add of a <Document> node
            exportFeatures.push(new Feature())
        }
        kmlString = kmlFormat.writeFeatures(exportFeatures, {
            dataProjection: WGS84.epsg, // KML files should always be WGS84
            featureProjection: projection.epsg,
        })

        // Remove no image hack. An empty icon tag is needed by OpenLayers to not show an icon
        // with the default style. "<scale>0</scale>" may also be needed by other implementations.
        kmlString = kmlString.replace(/<Icon>\s*<href>noimage<\/href>\s*<\/Icon>/g, '<Icon></Icon>')

        // Remove empty placemark added to have <Document> tag
        kmlString = kmlString.replace(/<Placemark\/>/g, '')
        kmlString = kmlString.replace(
            /<Document>/,
            `<Document><name>${fileName ?? i18n.global.t('draw_layer_label')}</name>`
        )
    }
    return kmlString
}
