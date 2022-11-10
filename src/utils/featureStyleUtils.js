import { fromString } from 'ol/color'

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

    getStrippedObject() {
        /* Warning: Changing this method will break the compability of KML files */
        return {
            name: this.name,
            fill: this.fill,
            border: this.border,
        }
    }

    static recreateObject(o) {
        return new FeatureStyleColor(o.name, o.fill, o.border)
    }

    static generateFromFillColorArray(fillColor) {
        if (!fillColor) {
            return
        }
        const fill =
            '#' +
            fillColor
                .slice(0, 3)
                .map((color) => ('0' + color.toString(16)).slice(-2))
                .reduce((prev, current) => prev + current)
        const matchingColor = allStylingColors.find((color) => color.fill === fill)
        return matchingColor ?? new FeatureStyleColor('unknown', fill, '#ffffff')
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

    getStrippedObject() {
        /* Warning: Changing this method will break the compability of KML files */
        return {
            label: this.label,
            textScale: this.textScale,
            iconScale: this.iconScale,
        }
    }

    static recreateObject(o) {
        return new FeatureStyleSize(o.label, o.textScale, o.iconScale)
    }

    static getFromTextScale(textScale) {
        if (!textScale) {
            return
        }
        const matchingScale = allStylingSizes.find((size) => size.textScale === textScale)
        return matchingScale ?? new FeatureStyleSize('unknown', textScale, 1)
    }

    static getFromIconScale(iconScale) {
        if (!iconScale) {
            return
        }
        const matchingScale = allStylingSizes.find((size) => size.iconScale === iconScale)
        return matchingScale ?? new FeatureStyleSize('unknown', 1, iconScale)
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

export const SMALL = new FeatureStyleSize('small_size', 1.0, 0.5)
export const MEDIUM = new FeatureStyleSize('medium_size', 1.5, 1.0)
export const LARGE = new FeatureStyleSize('big_size', 2.0, 2.0)

/**
 * List of all available sizes for drawing style
 *
 * @type {FeatureStyleSize[]}
 */
export const allStylingSizes = [SMALL, MEDIUM, LARGE]
