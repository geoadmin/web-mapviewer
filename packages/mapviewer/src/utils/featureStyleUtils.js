import { fromString } from 'ol/color'
import { Fill, Stroke, Text } from 'ol/style'
import Style from 'ol/style/Style'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { DEFAULT_TITLE_OFFSET } from '@/api/icon.api'
import { dashedRedStroke, whiteSketchFill } from '@/utils/styleUtils.js'

/** A color that can be used to style a feature (comprised of a fill and a border color) */
export class FeatureStyleColor {
    /**
     * @param name {String} Name of the color in english lower cased
     * @param fill {String} HTML color code for the fill color (starting with a # sign)
     * @param border {String} HTML color code for the border color (starting with a # sign)
     */
    constructor(name, fill, border) {
        this._name = name
        this._fill = fill
        this._border = border
    }

    /** @returns {String} Name of this color in lower case english */
    get name() {
        return this._name
    }

    /**
     * @returns {String} HTML color (with # prefix) describing this color (usable in CSS or other
     *   styling context)
     */
    get fill() {
        return this._fill
    }

    /**
     * @returns {String} HTML color (with # prefix) describing the border color (usable in CSS or
     *   other styling context)
     */
    get border() {
        return this._border
    }

    /** @returns {Number[]} Array representing the fill color as RGB values */
    get rgb() {
        return fromString(this._fill)
    }

    /** @returns {String} RGB properties but represented as a string "r,g,b" */
    get rgbString() {
        return `${this.rgb[0]},${this.rgb[1]},${this.rgb[2]}`
    }

    /**
     * @returns {String} CSS string describing the text shadow that must be applied when coloring a
     *   text with this color
     */
    get textShadow() {
        return `-1px -1px 0 ${this._border}, 1px -1px 0 ${this._border}, -1px 1px 0 ${this._border},1px 1px 0 ${this._border}`
    }
}

export const BLACK = new FeatureStyleColor('black', '#000000', '#ffffff')
export const BLUE = new FeatureStyleColor('blue', '#0000ff', '#ffffff')
export const GRAY = new FeatureStyleColor('gray', '#808080', '#ffffff')
export const GREEN = new FeatureStyleColor('green', '#008000', '#ffffff')
export const ORANGE = new FeatureStyleColor('orange', '#ffa500', '#000000')
export const RED = new FeatureStyleColor('red', '#ff0000', '#ffffff')
export const WHITE = new FeatureStyleColor('white', '#ffffff', '#000000')
export const YELLOW = new FeatureStyleColor('yellow', '#ffff00', '#000000')

export const allStylingColors = [BLACK, BLUE, GRAY, GREEN, ORANGE, RED, WHITE, YELLOW]
export const FEATURE_FONT_SIZE = 16
export const FEATURE_FONT_SIZE_SMALL = 14
export const FEATURE_FONT = 'Helvetica'
/**
 * Representation of a size for feature style
 *
 * Scale values (that are to apply to the KML/GeoJSON) are different for text and icon. For icon the
 * scale is the one used by open layer and is scaled up by the factor icon_size/32, see
 * https://github.com/openlayers/openlayers/issues/12670
 */
export class FeatureStyleSize {
    /**
     * @param {String} label Translation key for this size (must go through the i18n service to have
     *   a human-readable value)
     * @param {Number} textScale Scale to apply to a text when choosing this size (related to
     *   KML/GeoJSON styling)
     * @param {Number} iconScale Scale to apply to an icon when choosing this size (related to
     *   KML/GeoJSON styling)
     */
    constructor(label, textScale, iconScale) {
        this._label = label
        this._textScale = textScale
        this._iconScale = iconScale
    }

    /**
     * @returns {String} Translation key for this size (has to go through the i18n service to have a
     *   human-readable value)
     */
    get label() {
        return this._label
    }

    /**
     * @returns {Number} Scale to apply to a text when choosing this size (related to KML/GeoJSON
     *   styling)
     */
    get textScale() {
        return this._textScale
    }

    /**
     * @returns {Number} Scale to apply to an icon when choosing this size (related to KML/GeoJSON
     *   styling)
     */
    get iconScale() {
        return this._iconScale
    }

    get font() {
        return `normal ${FEATURE_FONT_SIZE * this.textScale}px ${FEATURE_FONT}`
    }
}

/**
 * NOTE: Here below the icons scale is the one used by openlayer, not the final scale put in the KML
 * file. In the kml the scale will be set with a factor icon_size/32 => 48/32 => 1.5. The text scale
 * is unchanged and the scale in openlayer match the KML scale.
 */
export const SMALL = new FeatureStyleSize('small_size', 1, 0.5)
export const MEDIUM = new FeatureStyleSize('medium_size', 1.5, 0.75)
export const LARGE = new FeatureStyleSize('large_size', 2.0, 1)
export const EXTRA_LARGE = new FeatureStyleSize('extra_large_size', 2.5, 1.25)

export const LEFT = 'left'
export const RIGHT = 'right'
export const TOP = 'top'
export const BOTTOM = 'bottom'
export const CENTER = 'center'
export const UNKNOWN = 'unknown'
export const TOP_LEFT = 'top-left'
export const TOP_RIGHT = 'top-right'
export const BOTTOM_LEFT = 'bottom-left'
export const BOTTOM_RIGHT = 'bottom-right'

/**
 * List of all available sizes for drawing style
 *
 * @type {FeatureStyleSize[]}
 */
export const allStylingSizes = [SMALL, MEDIUM, LARGE, EXTRA_LARGE]
export const allStylingTextPlacements = [
    TOP_LEFT,
    TOP,
    TOP_RIGHT,
    LEFT,
    CENTER,
    RIGHT,
    BOTTOM_LEFT,
    BOTTOM,
    BOTTOM_RIGHT,
]
export const allStylingTextPlacementsWithUnknown = [...allStylingTextPlacements, UNKNOWN]

/**
 * Get Feature style from feature
 *
 * @param {Feature} olFeature
 * @returns {Style}
 */
export function getStyle(olFeature) {
    const styles = olFeature.getStyleFunction()(olFeature)
    if (Array.isArray(styles)) {
        return styles[0]
    } else if (styles instanceof Style) {
        return styles
    }
    return null
}

/**
 * Return an instance of this class matching the requested fill color
 *
 * Default to RED if the color code is not found or invalid !
 *
 * @param {[Number]} fillColor Rgb array of the requested fill color
 * @returns {FeatureStyleColor} Returns the feature style color
 */
export function getFeatureStyleColor(fillColor) {
    if (!Array.isArray(fillColor)) {
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
 * Return an instance of FeatureStyleSize matching the requested text scale
 *
 * @param {Number} textScale The requested text scale
 * @returns {FeatureStyleSize | null} Returns text size or null if not found
 */
export function getTextSize(textScale) {
    if (textScale) {
        return allStylingSizes.find((size) => size.textScale === textScale) ?? MEDIUM
    }
    return null
}

/**
 * Get KML text color from style
 *
 * When a text is present but no color is given, then default to RED.
 *
 * @param {Style} style Feature style
 * @returns {FeatureStyleColor | null} Returns the feature style color object or null if text is not
 *   found
 */
export function getTextColor(style) {
    if (style?.getText()) {
        return getFeatureStyleColor(style.getText().getFill()?.getColor())
    }
    return null
}

/**
 * Calculate text alignment from style parameters *
 *
 * @param {Number} textScale Text scaling
 * @param {Number} iconScale Icon scaling
 * @param {Array} anchor Relative position of Anchor
 * @param {Array} iconSize Absolute size of icon in pixel
 *
 * @typedef {'top-left' | 'top' | 'top-right', | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right' | 'unknown'} TextPlacement
 * @param {TextPlacement} textPlacement Absolute position of text in pixel
 * @returns {Array} Returns the feature label offset
 */
export function calculateTextOffset(textScale, iconScale, anchor, iconSize, textPlacement, text) {
    if (!iconScale) {
        return DEFAULT_TITLE_OFFSET
    }
    const [textPlacementX, textPlacementY] = calculateTextXYOffset(
        textScale,
        iconScale,
        anchor,
        iconSize,
        text
    )

    return calculateTextOffsetFromPlacement(textPlacementX, textPlacementY, textPlacement)
}

/**
 * Calculate the text X and Y offset that can be applied to the text depending on the text position
 *
 * @param {Number} textScale Text scaling
 * @param {Number} iconScale Icon scaling
 * @param {Array} anchor Relative position of Anchor
 * @param {Array} iconSize Absolute size of icon in pixel
 * @param {String} text Text to display
 * @returns {Array} Returns the default X and Y label offset in pixel
 */
export function calculateTextXYOffset(textScale, iconScale, anchor, iconSize, text) {
    const fontSize = 11
    const anchorScale = anchor ? anchor[1] * 2 : 1

    const iconOffset = 0.5 * iconScale * anchorScale * iconSize[1]
    const textOffset = 0.5 * fontSize * textScale
    const textWidth = calculateFeatureTextWidth(text, textScale)
    const defaultOffset = 5

    return [
        defaultOffset + iconOffset + textOffset + textWidth / 2, // / 2 because the text is centered so the textWidth has to be halved
        defaultOffset + iconOffset + textOffset,
    ]
}

/**
 * Calculate the text offset from the text placement and the default offset
 *
 * @param {Number} defaultXOffset Default X offset
 * @param {Number} defaultYOffset Default Y offset
 * @param {String} placement Text placement
 * @returns {Array} Returns the default X and Y label offset in pixel
 */
export function calculateTextOffsetFromPlacement(defaultXOffset, defaultYOffset, placement) {
    const offsets = {
        [TOP_LEFT]: [-defaultXOffset, -defaultYOffset],
        [TOP]: [0, -defaultYOffset],
        [TOP_RIGHT]: [defaultXOffset, -defaultYOffset],
        [LEFT]: [-defaultXOffset, 0],
        [CENTER]: [0, 0],
        [RIGHT]: [defaultXOffset, 0],
        [BOTTOM_LEFT]: [-defaultXOffset, defaultYOffset],
        [BOTTOM]: [0, defaultYOffset],
        [BOTTOM_RIGHT]: [defaultXOffset, defaultYOffset],
    }

    return offsets[placement] || [0, 0]
}

/**
 * Calculates the width of a feature text given a text and a text scale
 *
 * @param {String} text
 * @param {Number} textScale
 * @returns
 */
export function calculateFeatureTextWidth(text, textScale) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    // In unit tests the context is not available
    if (!context) {
        return 0
    }
    context.font = `normal ${FEATURE_FONT_SIZE * textScale}px ${FEATURE_FONT}`
    return context.measureText(text).width
}

/**
 * Returns offset (compared to marker) for text around it, depending on the text position and if the
 * description should be shown on the map too.
 *
 * @param {EditableFeature} editableFeature
 * @returns {{ top: [number, number]; bottom: [number, number] }}
 */
function getElementOffsets(editableFeature) {
    if (!editableFeature) {
        return {
            top: [0, 0],
            bottom: [0, 0],
        }
    }

    const offsetTopElement = [...editableFeature.textOffset]
    const offsetBottomElement = [...editableFeature.textOffset]

    if (editableFeature.showDescriptionOnMap && editableFeature.description) {
        const isTextAtBottom = [BOTTOM_LEFT, BOTTOM, BOTTOM_RIGHT].includes(
            editableFeature.textPlacement
        )
        const isTextAtCenter = [CENTER, RIGHT, LEFT].includes(editableFeature.textPlacement)

        const descriptionLineWrapCount = editableFeature.description.split('\n').length ?? 0
        const descriptionBlocHeight = descriptionLineWrapCount * FEATURE_FONT_SIZE_SMALL
        const extraOffsetTopElement = (descriptionLineWrapCount + 1) * FEATURE_FONT_SIZE_SMALL
        const extraOffsetBottomElement =
            descriptionLineWrapCount > 1
                ? ((descriptionLineWrapCount - 1) * FEATURE_FONT_SIZE_SMALL) / 2.0
                : 0

        offsetTopElement[1] = offsetTopElement[1] - extraOffsetTopElement
        offsetBottomElement[1] = offsetBottomElement[1] - extraOffsetBottomElement

        if (isTextAtCenter) {
            // adding half the height of the description to all offsetY, to better center the elements vertically
            offsetBottomElement[1] = offsetBottomElement[1] + descriptionBlocHeight / 2.0
            offsetTopElement[1] = offsetTopElement[1] + descriptionBlocHeight / 2.0
        }
        if (isTextAtBottom) {
            // adding the full height of the description to both elements
            offsetBottomElement[1] = offsetBottomElement[1] + descriptionBlocHeight
            offsetTopElement[1] = offsetTopElement[1] + descriptionBlocHeight
        }
    }
    return {
        top: offsetTopElement,
        bottom: offsetBottomElement,
    }
}

/**
 * Style function that renders a feature with the distinct Geoadmin style. Meaning, by default, all
 * red.
 *
 * If an editableFeature is found attached to the feature, its properties will be used to set
 * color/text and such things.
 *
 * To style a selected feature, within the drawing module context, please use
 * {@link editingFeatureStyleFunction}
 *
 * @param {Feature} feature OpenLayers feature to style
 * @param {number} resolution The resolution of the map in map units / pixel (which is equatorial
 *   meters / pixel for the webmercator projection used in this project)
 * @returns {Style[]}
 */
export function geoadminStyleFunction(feature, resolution) {
    const editableFeature = feature.get('editableFeature')

    const styleConfig = {
        fillColor: editableFeature?.fillColor ?? RED,
        strokeColor: editableFeature?.strokeColor ?? RED,
        textColor: editableFeature?.textColor ?? RED,
    }

    // Tells if we are drawing a polygon for the first time, in this case we want
    // to fill this polygon with a transparent white (instead of red)
    const isDrawing = !!feature.get('isDrawing')

    const { top: offsetTopElement, bottom: offsetBottomElement } =
        getElementOffsets(editableFeature)

    const styles = [
        new Style({
            geometry: feature.get('geodesic')?.getGeodesicGeom() ?? feature.getGeometry(),
            image: editableFeature?.generateOpenlayersIcon(),
            text: new Text({
                text: editableFeature?.title ?? feature.get('name'),
                font: `normal ${FEATURE_FONT_SIZE}px ${FEATURE_FONT}`,
                fill: new Fill({
                    color: styleConfig.textColor.fill,
                }),
                stroke: new Stroke({
                    color: styleConfig.textColor.border,
                    width: 3,
                }),
                scale: editableFeature?.textSizeScale ?? 1,
                offsetX: offsetTopElement[0],
                offsetY: offsetTopElement[1],
            }),
            stroke:
                editableFeature?.featureType === EditableFeatureTypes.MEASURE
                    ? dashedRedStroke
                    : new Stroke({
                          color: styleConfig.fillColor.fill,
                          width: 3,
                      }),
            // filling a polygon with white if first time being drawn (otherwise fallback to user set color)
            fill: isDrawing
                ? whiteSketchFill
                : new Fill({
                      color: [...styleConfig.fillColor.rgb.slice(0, 3), 0.4],
                  }),
            zIndex: 10,
        }),
    ]
    if (editableFeature?.showDescriptionOnMap && editableFeature?.description) {
        styles.push(
            new Style({
                text: new Text({
                    text: editableFeature.description,
                    font: `normal ${FEATURE_FONT_SIZE_SMALL}px ${FEATURE_FONT}`,
                    fill: new Fill({
                        color: styleConfig.textColor.fill,
                    }),
                    stroke: new Stroke({
                        color: styleConfig.textColor.border,
                        width: 2,
                    }),
                    offsetX: offsetBottomElement[0],
                    offsetY: offsetBottomElement[1],
                }),
            })
        )
    }
    const polygonGeom = feature.get('geodesic')?.getGeodesicPolygonGeom()
    if (polygonGeom) {
        styles.push(
            new Style({
                geometry: polygonGeom,
                fill: isDrawing
                    ? whiteSketchFill
                    : new Fill({
                          color: [...styleConfig.fillColor.rgb.slice(0, 3), 0.4],
                      }),
                zIndex: 0,
                stroke: new Stroke({
                    color: styleConfig.strokeColor.fill,
                    width: 3,
                }),
            })
        )
    }
    /* This function is also called when saving the feature to KML, where "feature.get('geodesic')"
    is not there anymore, thats why we have to check for it here */
    if (editableFeature?.featureType === EditableFeatureTypes.MEASURE && feature.get('geodesic')) {
        styles.push(...feature.get('geodesic').getMeasureStyles(resolution))
    }
    return styles
}
