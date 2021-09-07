/**
 * Representation of a size for the drawing module.
 *
 * Scale values (that are to apply to the KML/GeoJSON) are different for text and icon
 */
export default class DrawingStyleSize {
    /**
     * @param {String} label Translation key for this size (must go through the i18n service to have
     *   a human readable value)
     * @param {Number} textScale Scale to apply to a text when choosing this size (related to
     *   KML/GeoJSON styling)
     * @param {Number} iconScale Scale to apply to an icon when choosing this size (related to
     *   KML/GeoJSON styling)
     */
    constructor(label, textScale, iconScale) {
        /**
         * Translation key for this size (has to go through the i18n service to have a human readable value)
         *
         * @type {String}
         */
        this.label = label
        /**
         * Scale to apply to a text when choosing this size (related to KML/GeoJSON styling)
         *
         * @type {Number}
         */
        this.textScale = textScale
        /**
         * Scale to apply to an icon when choosing this size (related to KML/GeoJSON styling)
         *
         * @type {Number}
         */
        this.iconScale = iconScale
    }
}

export const SMALL = new DrawingStyleSize('small_size', 1.0, 0.5)
export const MEDIUM = new DrawingStyleSize('medium_size', 1.5, 1.0)
export const LARGE = new DrawingStyleSize('big_size', 2.0, 2.0)

/**
 * List of all available sizes for drawing style
 *
 * @type {DrawingStyleSize[]}
 */
export const drawingStyleSizes = [SMALL, MEDIUM, LARGE]
