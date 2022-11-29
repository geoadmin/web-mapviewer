import { EditableFeature, EditableFeatureTypes } from '@/api/features.api'
import { DrawingIcon } from '@/api/icon.api'
import { extractOlFeatureCoordinates } from '@/modules/drawing/lib/drawingUtils'
import {
    allStylingColors,
    allStylingSizes,
    FeatureStyleColor,
    FeatureStyleSize, MEDIUM, RED, SMALL
} from "@/utils/featureStyleUtils";
import log from '@/utils/logging'
import Feature from 'ol/Feature'
import { getDefaultStyle } from 'ol/format/KML'
import { Polygon } from 'ol/geom'
import IconStyle from 'ol/style/Icon'
import Style from 'ol/style/Style'

/**
 * This is a helper function for {@link deserialize} that generates an editable feature based on the
 * style stored in the kml '<style>' tag. Only works with kmls that were generated with
 * mf-geoadmin3
 *
 * @param {Feature} legacyKmlFeature An olFeature that was just deserialized with {@link KML}
 * @param {DrawingIconSet[]} availableIconSets
 * @returns {EditableFeature}
 */
export function getEditableFeatureFromLegacyKmlFeature(legacyKmlFeature, availableIconSets) {
    if (
        !(legacyKmlFeature instanceof Feature) ||
        !Array.isArray(availableIconSets) ||
        availableIconSets.length === 0
    ) {
        return null
    }
    const geom = legacyKmlFeature.getGeometry()
    // The kml parser automatically created a style based on the "<style>" part of the feature in the kml file.
    // We will now analyse this style to retrieve all information we need to generate the editable feature.
    const style = parseStyle(legacyKmlFeature)
    if (!style) {
        throw new Error('Parsing error: Could not get the style from the ol Feature')
    }
    const featureType = legacyKmlFeature.get('type').toUpperCase() // only set by mf-geoadmin3's kml
    if (!Object.values(EditableFeatureTypes).includes(featureType)) {
        throw new Error('Parsing error: Type of features in kml not recognized')
    }
    const coordinates = parseCoordinate(legacyKmlFeature)
    if (geom instanceof Polygon) {
        geom.setCoordinates([coordinates])
    } else {
        geom.setCoordinates(coordinates)
    }
    const textSize = parseTextSize(style)
    const featureId = parseFeatureID(legacyKmlFeature)

    const title = legacyKmlFeature.get('name') ?? ''
    const textColor = title /*facultative on marker, never present on measure and linepolygon*/
        ? getFromFillColorArray(style.getText()?.getFill()?.getColor())
        : undefined
    return EditableFeature.constructWithObject({
        id: featureId,
        coordinates: coordinates,
        featureType: featureType,
        title,
        description: legacyKmlFeature.get('description') ?? '', // only set by mf-geoadmin3's kml
        textColor,
        /* Fillcolor can be either the color of the stroke or the color of the icon. If an icon
        is defined, the following color will be overridden by the icon color. */
        fillColor: getFromFillColorArray(style.getFill()?.getColor()),
        textSize: title ? getFromTextScale(textSize) : undefined,
        iconSize: undefined,
        // This is at the end as it may overwrite arguments already defined above
        ...findIconFromOlIcon(style, availableIconSets),
    })
}

/**
 * @param legacyKmlFeature
 * @returns {Style}
 */
function parseStyle(legacyKmlFeature) {
    const styles = legacyKmlFeature.getStyle()(legacyKmlFeature)
    if (Array.isArray(styles)) {
        return styles[0]
    } else if (styles instanceof Style) {
        return styles
    }
    return null
}

function parseCoordinate(legacyKmlFeature) {
    let coordinates = extractOlFeatureCoordinates(legacyKmlFeature)
    // We do not want to store the z coordinate (height)
    if (Array.isArray(coordinates[0])) {
        coordinates = coordinates.map((coordinate) => coordinate.slice(0, 2))
    } else {
        coordinates = coordinates.slice(0, 2)
    }
    return coordinates
}

/**
 * @param {Style} style
 * @returns {null | IconStyle}
 */
function parseIcon(style) {
    if (!style && !(style instanceof Style)) {
        return null
    }
    let icon = style.getImage()
    if (!(icon instanceof IconStyle)) {
        return null
    }
    // To interpret the KMLs the same way as GoogleEarth, the kml parser automatically adds a Google icon
    // if no icon is present (i.e. for our text feature type), but we do not want that.
    if (
        icon?.getSrc()?.match(/google/) ||
        icon?.getSrc() === getDefaultStyle()?.getImage()?.getSrc()
    ) {
        return null
    }
    return icon
}

/**
 * @param {Style} style
 * @returns {number}
 */
function parseTextSize(style) {
    // When exporting the kml, the parser does not put a scale property when the scale is 1.
    // But when importing the kml, it seems that the parser interprets the lack of a scale
    // property as if the scale was 0.8, which is strange. The code below tries to fix that.
    let textSize = style.getText()?.getScale()
    if (textSize === getDefaultStyle()?.getText()?.getScale()) {
        return 1
    }
    return textSize
}

function parseFeatureID(legacyKmlFeature) {
    const featureType = legacyKmlFeature.get('type').toUpperCase()
    // In the old viewer, the kml feature id is of the form: "<featuretype>_<id>".
    // In the new viewer, it is of the form: "drawing_feature_<id>".
    let featureId = legacyKmlFeature.getId().match(featureType.toLowerCase() + '_([0-9]+)$')?.[1]
    if (featureId) {
        return `drawing_feature_${featureId}`
    }
    return legacyKmlFeature.getId()
}

/**
 * @param {Style} style An olIcon generated by a kml coming from mf-geoadmin3
 * @param {DrawingIconSet[]} availableIconSets
 * @returns A list of arguments that can be passed to {@link constructWithObject}.
 */
function findIconFromOlIcon(style, availableIconSets) {
    const iconStyle = parseIcon(style)
    if (!(style instanceof Style) || !iconStyle) {
        return {}
    }
    iconStyle.setDisplacement([0, 0])
    const url = iconStyle.getSrc()
    const setName = url.match(/images\/(\w+)\/[^\/]+\.png$/)?.[1] ?? 'default'

    const iconSet = availableIconSets.find((drawingIconSet) => drawingIconSet.name === setName)
    if (!iconSet) {
        log.error('Parsing error: Could not retrieve icon set from legacy icon URL')
        return { icon: generateIconFromOlIcon(iconStyle) }
    }
    let icon = null,
        args = {}
    if (setName === 'default') {
        let color = url
            .match(/color\/([0-9]{1,3}),([0-9]{1,3}),([0-9]{1,3})\/[^\/]+\.png$/)
            ?.slice(1, 4)
            ?.map((nb) => Math.min(Number(nb), 255))
        if (!Array.isArray(color) || color.length !== 3) {
            log.error('Parsing error: Could not retrieve color from legacy icon URL')
            return {}
        } else {
            args.fillColor = getFromFillColorArray(color)
        }
        let iconName = url.match(/color\/[^\/]+\/(\w+)-24@2x\.png$/)?.[1] ?? 'unknown'
        icon = iconSet.icons.find((drawingIcon) =>
            drawingIcon.name.match('^[0-9]+-' + iconName + '$')
        )
    } else {
        let iconName = url.match(/images\/\w+\/([\w-]+)\.png$/)?.[1]
        icon = iconSet.icons.find((drawingIcon) => drawingIcon.name === iconName)
    }
    if (!icon) {
        log.error('Parsing error: Could not retrieve icon from legacy icon URL')
        args.icon = generateIconFromOlIcon(iconStyle)
    } else {
        args.icon = icon
    }
    /* For the openlayers scale property and the kml files generated by the old viewer,
    a scale of 1 is the original size of the icon (which is always 48px for icons used by
    the old viewer). In the kml format used by the new viewer however, a scale of 1 is
    always 32px, no matter the size of the icon. So the kml formatter misinterprets the
    kml scale property for kml files from the old viewer and we have to multiply that scale
    by 1.5 to get the correct scale again.*/
    // SMALL = 0.5 , MEDIUM = 0.75 , LARGE = 1 for icons from the old viewer
    const iconScale = iconStyle.getScale() * 1.5
    args.iconSize = getFromIconScale(iconScale)
    return args
}

/**
 * Return an instance of this class matching the requested fill color
 *
 * @param {[Number]} fillColor Rgb array of the requested fill color
 * @returns {FeatureStyleColor}
 */
function getFromFillColorArray(fillColor) {
    if (!fillColor) {
        return RED
    }
    const fill =
        '#' +
        fillColor
            .slice(0, 3)
            .map((color) => ('0' + color.toString(16)).slice(-2))
            .reduce((prev, current) => prev + current)
    return allStylingColors.find((color) => color.fill === fill) ?? RED
}

/**
 * Generates a new icon that has the url of the given olIcon
 *
 * @param {IconStyle} iconStyle
 * @returns {DrawingIcon}
 */
function generateIconFromOlIcon(iconStyle) {
    if (!iconStyle) {
        return null
    }
    iconStyle.setDisplacement([0, 0])
    const url = iconStyle.getSrc()
    const size = iconStyle.getSize()
    let anchor = iconStyle.getAnchor()
    anchor[0] /= size[0]
    anchor[1] /= size[1]
    return url && anchor ? new DrawingIcon('unknown', url, url, 'unknown', anchor) : null
}

/**
 * Return an instance of FeatureStyleSize matching the requested text scale
 *
 * @param {Number} textScale The requested text scale
 * @returns {FeatureStyleSize}
 */
function getFromTextScale(textScale) {
    if (textScale) {
        return allStylingSizes.find((size) => size.textScale === textScale) ?? MEDIUM
    }
    return MEDIUM
}

/**
 * Return an instance of this class matching the requested icon scale
 *
 * @param {Number} iconScale The requested icon scale
 * @returns {FeatureStyleSize}
 */
function getFromIconScale(iconScale) {
    if (iconScale) {
        return allStylingSizes.find((size) => size.iconScale === iconScale) ?? SMALL
    }
    return SMALL
}
