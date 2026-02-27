import type { Color } from 'ol/color'
import type { ColorLike, PatternDescriptor } from 'ol/colorlike'
import type { default as Feature, FeatureLike } from 'ol/Feature'
import type { Size } from 'ol/size'

import { DEFAULT_ICON_SIZE, DEFAULT_TITLE_OFFSET } from '@swissgeo/staging-config/constants'
import { styleUtils } from '@swissgeo/theme'
import { fromString } from 'ol/color'
import RenderFeature from 'ol/render/Feature'
import { Fill, Stroke, Text } from 'ol/style'
import Icon from 'ol/style/Icon'
import Style from 'ol/style/Style'

import type {
    EditableFeature,
    FeatureStyleColor,
    FeatureStyleSize,
    TextPlacement,
} from '@/types/features'

import iconsAPI from '@/icons'

/**
 * @returns CSS string describing the text shadow that must be applied when coloring a text with
 *   this color
 */
function generateTextShadow(style: FeatureStyleColor): string {
    return `-1px -1px 0 ${style.border}, 1px -1px 0 ${style.border}, -1px 1px 0 ${style.border},1px 1px 0 ${style.border}`
}

function generateRGBFillString(style: FeatureStyleColor): string {
    const rgb = fromString(style.fill)
    return `${rgb[0]},${rgb[1]},${rgb[2]}`
}

const BLACK: FeatureStyleColor = { name: 'black', fill: '#000000', border: '#ffffff' }
const BLUE: FeatureStyleColor = { name: 'blue', fill: '#0000ff', border: '#ffffff' }
const GRAY: FeatureStyleColor = { name: 'gray', fill: '#808080', border: '#ffffff' }
const GREEN: FeatureStyleColor = { name: 'green', fill: '#008000', border: '#ffffff' }
const ORANGE: FeatureStyleColor = { name: 'orange', fill: '#ffa500', border: '#000000' }
const RED: FeatureStyleColor = { name: 'red', fill: '#ff0000', border: '#ffffff' }
const WHITE: FeatureStyleColor = { name: 'white', fill: '#ffffff', border: '#000000' }
const YELLOW: FeatureStyleColor = { name: 'yellow', fill: '#ffff00', border: '#000000' }

const allStylingColors: FeatureStyleColor[] = [BLACK, BLUE, GRAY, GREEN, ORANGE, RED, WHITE, YELLOW]
const FEATURE_FONT_SIZE = 16
const FEATURE_FONT_SIZE_SMALL = 14
const FEATURE_FONT = 'Helvetica'

function generateFontString(size: FeatureStyleSize, font = FEATURE_FONT) {
    return `normal ${FEATURE_FONT_SIZE * size.textScale}px ${font}`
}
/**
 * NOTE: Here below the icons scale is the one used by openlayer, not the final scale put in the KML
 * file. In the kml the scale will be set with a factor icon_size/32 => 48/32 => 1.5. The text scale
 * is unchanged and the scale in openlayer match the KML scale.
 */
const SMALL: FeatureStyleSize = { label: 'small_size', textScale: 1, iconScale: 0.5 }
const MEDIUM: FeatureStyleSize = { label: 'medium_size', textScale: 1.5, iconScale: 0.75 }
const LARGE: FeatureStyleSize = { label: 'large_size', textScale: 2.0, iconScale: 1 }
const EXTRA_LARGE: FeatureStyleSize = {
    label: 'extra_large_size',
    textScale: 2.5,
    iconScale: 1.25,
}

/** List of all available sizes for drawing style */
const allStylingSizes: FeatureStyleSize[] = [SMALL, MEDIUM, LARGE, EXTRA_LARGE]

/** Get Feature style from feature */
export function getStyle(olFeature: Feature, resolution: number): Style | undefined {
    const styleFunction = olFeature.getStyleFunction()
    if (!styleFunction) {
        return
    }
    const styles = styleFunction(olFeature, resolution)
    if (Array.isArray(styles)) {
        return styles[0]
    } else if (styles instanceof Style) {
        return styles
    }
    return
}

/**
 * Return an instance of this class matching the requested fill color
 *
 * Default to RED if the color code is not found or invalid !
 *
 * @param fillColor Rgb array of the requested fill color
 * @returns The feature style color
 */
function getFeatureStyleColor(
    fillColor: Color | ColorLike | PatternDescriptor | null
): FeatureStyleColor {
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
 * @param textScale The requested text scale
 * @returns Text size or undefined if not found
 */
function getTextSize(textScale?: number): FeatureStyleSize | undefined {
    if (textScale) {
        return allStylingSizes.find((size) => size.textScale === textScale) ?? MEDIUM
    }
    return
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
function getTextColor(style: Style): FeatureStyleColor | undefined {
    const styleColor = style?.getText()?.getFill()?.getColor()
    if (Array.isArray(styleColor)) {
        return getFeatureStyleColor(styleColor)
    }
    return
}

/**
 * Calculate text alignment from style parameters *
 *
 * @param textScale
 * @param iconScale
 * @param anchor Relative position of the anchor
 * @param iconSize Absolute size of the icon in pixel
 * @param textPlacement Absolute position of the text in pixel
 * @param text
 * @returns The feature label offset
 */
function calculateTextOffset(
    textScale: number,
    iconScale: number,
    anchor: [number, number],
    iconSize: [number, number],
    textPlacement: TextPlacement,
    text: string
): [number, number] {
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
 * @param textScale
 * @param iconScale
 * @param anchor Relative position of the anchor
 * @param iconSize Absolute size of the icon in pixel
 * @param text Text to display
 * @returns The default X and Y label offset in pixel
 */
function calculateTextXYOffset(
    textScale: number,
    iconScale: number | Size,
    anchor: [number, number],
    iconSize: [number, number],
    text: string
): [number, number] {
    const fontSize = 11
    const anchorScale: number = anchor ? anchor[1] * 2 : 1

    const iconScaleXY: [number, number] = Array.isArray(iconScale)
        ? [iconScale[0], iconScale[1]]
        : [iconScale, iconScale]

    const iconOffset: [number, number] = [
        0.5 * iconScaleXY[0] * anchorScale * iconSize[0],
        0.5 * iconScaleXY[1] * anchorScale * iconSize[1],
    ]

    const textOffset = 0.5 * fontSize * textScale
    const textWidth = calculateFeatureTextWidth(text, textScale)
    const defaultOffset = 5

    return [
        defaultOffset + iconOffset[0] + textOffset + textWidth / 2, // / 2 because the text is centered so the textWidth has to be halved
        defaultOffset + iconOffset[1] + textOffset,
    ]
}

/**
 * Calculate the text offset from the text placement and the default offset
 *
 * @param defaultXOffset
 * @param defaultYOffset
 * @param placement
 * @returns The default X and Y label offset in pixel
 */
function calculateTextOffsetFromPlacement(
    defaultXOffset: number,
    defaultYOffset: number,
    placement: TextPlacement
): [number, number] {
    if (placement === 'top-left') {
        return [-defaultXOffset, -defaultYOffset]
    } else if (placement === 'top') {
        return [0, -defaultYOffset]
    } else if (placement === 'top-right') {
        return [defaultXOffset, -defaultYOffset]
    } else if (placement === 'left') {
        return [-defaultXOffset, 0]
    } else if (placement === 'center') {
        return [0, 0]
    } else if (placement === 'right') {
        return [defaultXOffset, 0]
    } else if (placement === 'bottom-left') {
        return [-defaultXOffset, defaultYOffset]
    } else if (placement === 'bottom') {
        return [0, defaultYOffset]
    } else if (placement === 'bottom-right') {
        return [defaultXOffset, defaultYOffset]
    }
    return [0, 0]
}

/** Calculates the width of a feature text given a text and a text scale */
function calculateFeatureTextWidth(text: string, textScale: number): number {
    if (!document) {
        return 0
    }
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
 */
function getElementOffsets(editableFeature?: EditableFeature): {
    top: [number, number]
    bottom: [number, number]
} {
    if (!editableFeature) {
        return {
            top: [0, 0],
            bottom: [0, 0],
        }
    }

    const offsetTopElement: [number, number] = [...editableFeature.textOffset] as [number, number]
    const offsetBottomElement: [number, number] = [...editableFeature.textOffset] as [
        number,
        number,
    ]

    if (editableFeature.showDescriptionOnMap && editableFeature.description) {
        const isTextAtBottom =
            editableFeature.textPlacement === 'bottom' ||
            editableFeature.textPlacement === 'bottom-left' ||
            editableFeature.textPlacement === 'bottom-right'
        const isTextAtCenter =
            editableFeature.textPlacement === 'center' ||
            editableFeature.textPlacement === 'left' ||
            editableFeature.textPlacement === 'right'

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
 * @param feature OpenLayers feature to style
 * @param resolution The resolution of the map in map units / pixel (which is equatorial meters /
 *   pixel for the webmercator projection used in this project)
 */
function geoadminStyleFunction(
    feature: FeatureLike,
    resolution?: number
): Style | Style[] | undefined {
    const editableFeature = feature.get('editableFeature') as EditableFeature | undefined

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
    let image: Icon | undefined
    if (editableFeature?.icon) {
        image = new Icon({
            src: iconsAPI.generateIconURL(editableFeature.icon, editableFeature.fillColor?.fill),
            crossOrigin: 'Anonymous',
            anchor: editableFeature.icon.anchor,
            scale: editableFeature.iconSize?.iconScale,
        })
    }
    const featureGeometry = feature.getGeometry()
    if (!featureGeometry || featureGeometry instanceof RenderFeature) {
        return undefined
    }
    const styles = [
        new Style({
            geometry: featureGeometry,
            image,
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
                scale: editableFeature?.textSize?.textScale ?? 1,
                // only applying the text offset if the feature is a marker (has an icon)
                offsetX: editableFeature?.icon ? offsetTopElement[0] : undefined,
                offsetY: editableFeature?.icon ? offsetTopElement[1] : undefined,
            }),
            stroke:
                editableFeature?.featureType === 'MEASURE'
                    ? styleUtils.dashedRedStroke
                    : new Stroke({
                          color: styleConfig.fillColor.fill,
                          width: 3,
                      }),
            // filling a polygon with white if first time being drawn (otherwise fallback to user set color)
            fill: isDrawing
                ? styleUtils.whiteSketchFill
                : new Fill({
                      color: [...fromString(styleConfig.fillColor.fill).slice(0, 3), 0.4],
                  }),
            zIndex: styleUtils.StyleZIndex.MainStyle,
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
    if (featureGeometry.getType() === 'Polygon') {
        styles.push(
            new Style({
                geometry: featureGeometry,
                fill: isDrawing
                    ? styleUtils.whiteSketchFill
                    : new Fill({
                          color: [...fromString(styleConfig.fillColor.fill).slice(0, 3), 0.4],
                      }),
                zIndex: styleUtils.StyleZIndex.AzimuthCircle,
                stroke: new Stroke({
                    color: styleConfig.strokeColor.fill,
                    width: 3,
                }),
            })
        )
    }
    /* This function is also called when saving the feature to KML, where "feature.get('geodesic')"
    is not there anymore, thats why we have to check for it here */
    if (resolution && editableFeature?.featureType === 'MEASURE' && feature.get('geodesic')) {
        styles.push(...feature.get('geodesic').getMeasureStyles(resolution))
    }
    return styles
}

/** Default offset of title for the default marker */
const DEFAULT_MARKER_TITLE_OFFSET = calculateTextOffset(
    MEDIUM.textScale,
    MEDIUM.iconScale,
    [0, 0.875],
    DEFAULT_ICON_SIZE,
    'top',
    ''
)

export const featureStyleUtils = {
    generateTextShadow,
    generateRGBFillString,
    BLACK,
    BLUE,
    GRAY,
    GREEN,
    ORANGE,
    RED,
    WHITE,
    YELLOW,
    allStylingColors,
    FEATURE_FONT_SIZE,
    FEATURE_FONT_SIZE_SMALL,
    FEATURE_FONT,
    generateFontString,
    SMALL,
    MEDIUM,
    LARGE,
    EXTRA_LARGE,
    allStylingSizes,
    getStyle,
    getFeatureStyleColor,
    getTextSize,
    getTextColor,
    calculateTextOffset,
    calculateTextXYOffset,
    calculateTextOffsetFromPlacement,
    calculateFeatureTextWidth,
    geoadminStyleFunction,
    DEFAULT_MARKER_TITLE_OFFSET,
}

export default featureStyleUtils
