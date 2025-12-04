/** A color that can be used to style a feature (comprised of a fill and a border color) */
export interface FeatureStyleColor {
    /** Name of the color in english lower cased */
    name: string
    /** HTML color (with # prefix) describing this color (usable in CSS or other styling context) */
    fill: string
    /**
     * HTML color (with # prefix) describing the border color (usable in CSS or other styling
     * context)
     */
    border: string
}

/**
 * Representation of a size for feature style
 *
 * Scale values (that are to apply to the KML/GeoJSON) are different for text and icon. For icon the
 * scale is the one used by open layer and is scaled up by the factor icon_size/32, see
 * https://github.com/openlayers/openlayers/issues/12670
 */
export interface FeatureStyleSize {
    /**
     * Translation key for this size (must go through the i18n service to have a human-readable
     * value)
     */
    label: string
    /** Scale to apply to a text when choosing this size (related to KML/GeoJSON styling) */
    textScale: number
    /** Scale to apply to an icon when choosing this size (related to KML/GeoJSON styling) */
    iconScale: number
}

export type TextPlacement =
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'left'
    | 'center'
    | 'right'
    | 'bottom-left'
    | 'bottom'
    | 'bottom-right'
    | 'unknown'
