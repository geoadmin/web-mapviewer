import log from '@geoadmin/log'
import axios from 'axios'
import { fromString } from 'ol/color'

import { getViewerDedicatedServicesBaseUrl } from '@/config/baseUrl.config'
import { calculateTextOffset, FeatureStyleColor, MEDIUM, RED } from '@/utils/featureStyleUtils.ts'

/** Default Icon parameters for the URL. */
export const DEFAULT_ICON_URL_PARAMS = {
    scale: 1,
}

/** Default offset of title for any feature */
export const DEFAULT_TITLE_OFFSET = [0, 0]

/** Default size of icon for any feature */
const DEFAULT_ICON_SIZE = [48, 48]

/** Default offset of title for the default marker */
export const DEFAULT_MARKER_TITLE_OFFSET = calculateTextOffset(
    MEDIUM.textScale,
    MEDIUM.iconScale,
    [0, 0.875],
    DEFAULT_ICON_SIZE
)

/**
 * Generate an icon URL from its template. If no iconScale is given, the default scale 1 will be
 * applied. If no iconColor is given, red will be applied (if applicable, as non-colorable icons
 * will not have {r}, {g}, {b} part of their template URL)
 *
 * @param icon
 * @param iconColor The color to use for this icon's URL
 * @param iconScale The scale to use for this icon's URL
 * @returns  A full URL to this icon on the service-icons backend
 */
export function generateURL(icon: DrawingIcon, iconColor: FeatureStyleColor = RED, iconScale: number = DEFAULT_ICON_URL_PARAMS.scale) {
    const rgb = fromString(iconColor.fill)
    return icon.imageTemplateURL
        .replace('{icon_set_name}', icon.iconSetName)
        .replace('{icon_name}', icon.name)
        .replace('{icon_scale}', iconScale + 'x')
        .replace('{r}', `${rgb[0]}`)
        .replace('{g}', `${rgb[1]}`)
        .replace('{b}', `${rgb[2]}`)
}

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

/** Offset to apply to an icon when placed on a coordinate ([x,y]
 format) */
type DrawingIconAnchor = [number, number]
/** Size of the icons in pixel assuming a scaling factor of 1 */
type DrawingIconSize = [number, number]

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
    /** URL template where size and color can be defined (by
     replacing {icon_scale} and {{r},{g},{b}} respectively */
    imageTemplateURL: string
    /** Name of the icon set in which belongs this icon (an icon can only
     belong to one icon set) */
    iconSetName: string
    /** Description of icon in all available languages */
    description: string
    /** Offset to apply to this icon when placed on a coordinate ([x,y]
     format) */
    anchor: DrawingIconAnchor
    size: DrawingIconSize
}

/**
 * Retrieve all available icon sets from the backend.
 *
 * Also retrieve all available icons for those icon sets (so no need to do any additional request to
 * the backend after that)
 */
export async function loadAllIconSetsFromBackend(): Promise<DrawingIconSet[]> {
    const setPromises = []
    const sets = []
    try {
        const rawSets = (await axios.get(`${getViewerDedicatedServicesBaseUrl()}icons/sets`)).data
            .items
        for (const rawSet of rawSets) {
            const iconSet: DrawingIconSet = {
                name: rawSet.name as string,
                isColorable: !!rawSet.colorable,
                iconsURL: rawSet.icons_url as string,
                templateURL: rawSet.template_url as string,
                hasDescription: !!rawSet.has_description,
                language: rawSet.language as string,
                icons: []
            }
            // retrieving all icons for this icon set
            setPromises.push(loadIconsForIconSet(iconSet))
            sets.push(iconSet)
        }
        await Promise.all(setPromises)
    } catch (error) {
        log.error('Failed to retrieve icons sets', error)
    }
    return sets
}

/**
 * Loads all icons from an icon set and attach them to the icon set
 *
 * @param {DrawingIconSet} iconSet
 * @returns {Promise} Promise resolving when all icons have been attached to the icon set
 */
async function loadIconsForIconSet(iconSet) {
    try {
        const rawIcons = await axios.get(iconSet.iconsURL)

        iconSet.icons = rawIcons.data.items.map(
            (rawIcon) =>
                new DrawingIcon(
                    rawIcon.name,
                    rawIcon.url,
                    rawIcon.template_url,
                    iconSet.name,
                    rawIcon.description,
                    rawIcon.anchor,
                    rawIcon.size
                )
        )
    } catch (error) {
        log.error('Error getting icons for icon set', iconSet, error)
    }
}
