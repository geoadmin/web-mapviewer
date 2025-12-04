/**
 * Collection of icons belonging to the same "category" (or set).
 *
 * Some sets are colorable, where others aren't
 */
export interface DrawingIconSet {
    /** Name of this set in the backend, lower cased */
    name: string
    /**
     * Tells if this set's icons can be colored differently (if the color can be defined in each
     * icon's URL)
     */
    isColorable: boolean
    /* URL to the backend endpoint that gives all available icons for this set */
    iconsURL: string
    /**
     * A template URL to access this icon set's metadata ({icon_set_name} needs to be replaced with
     * this icon set's name)
     */
    templateURL: string
    /** Tells if this icon set has icon descriptions */
    hasDescription: boolean
    /**
     * Two letter iso code that corresponds to a specific language, if the icon set does not
     * correspond to a language it is null
     */
    language: string
    /** List of all icons from this icon set */
    icons: DrawingIcon[]
}

/** Offset to apply to an icon when placed on a coordinate ([x,y] format) */
export type DrawingIconAnchor = [number, number]
/** Size of the icons in pixel assuming a scaling factor of 1 */
export type DrawingIconSize = [number, number]

/**
 * Representation of one icon available in our backend.
 *
 * Each icon has a specific anchor (an offset from the coordinate it is linked to)
 */
export interface DrawingIcon {
    /** Name of this icon in the backend (lower cased) */
    name: string
    /** URL to the image of this icon itself (with default size and color) */
    imageURL: string
    /**
     * URL template where size and color can be defined (by replacing {icon_scale} and {{r},{g},{b}}
     * respectively
     */
    imageTemplateURL: string
    /** Name of the icon set in which belongs this icon (an icon can only belong to one icon set) */
    iconSetName: string
    /** Description of icon in all available languages */
    description?: Record<string, string>
    /** Offset to apply to this icon when placed on a coordinate ([x,y] format) */
    anchor: DrawingIconAnchor
    size: DrawingIconSize
}

interface IconAPIIconSet {
    colorable: boolean
    has_description: boolean
    icons_url: string
    language: string
    name: string
    template_url: string
}

export interface IconAPIIconSetsResponse {
    items: IconAPIIconSet[]
}
