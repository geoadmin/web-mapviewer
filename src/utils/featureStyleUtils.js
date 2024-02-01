import { fromString } from 'ol/color'
import Style from 'ol/style/Style'

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

/**
 * Representation of a size for feature style
 *
 * Scale values (that are to apply to the KML/GeoJSON) are different for text and icon
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
        return `normal ${16 * this.textScale}px Helvetica`
    }
}

export const VERY_SMALL = new FeatureStyleSize('very_small_size', 1.0, 0.5)
export const SMALL = new FeatureStyleSize('small_size', 1.25, 0.75)
export const MEDIUM = new FeatureStyleSize('medium_size', 1.5, 1.0)
export const LARGE = new FeatureStyleSize('big_size', 2.0, 1.5)

/**
 * List of all available sizes for drawing style
 *
 * @type {FeatureStyleSize[]}
 */
export const allStylingSizes = [VERY_SMALL, SMALL, MEDIUM, LARGE]

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
