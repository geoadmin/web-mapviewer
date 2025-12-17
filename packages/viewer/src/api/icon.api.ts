import log, { LogPreDefinedColor } from '@swissgeo/log'
import axios from 'axios'
import { fromString } from 'ol/color'

import type { FeatureStyleColor } from '@/utils/featureStyleUtils'

import { getViewerDedicatedServicesBaseUrl } from '@/config/baseUrl.config'
import { LARGE, RED } from '@/utils/featureStyleUtils'

/**
 * Generate an icon URL from its template. If no iconScale is given, the default scale 1 will be
 * applied. If no iconColor is given, red will be applied (if applicable, as non-colorable icons
 * will not have {r}, {g}, {b} part of their template URL)
 *
 * @returns A full URL to this icon on the service-icons backend
 */
export function generateIconURL(icon: DrawingIcon, iconColor: FeatureStyleColor = RED) {
    const rgb = fromString(iconColor.fill)
    return (
        icon.imageTemplateURL
            .replace('{icon_set_name}', icon.iconSetName)
            .replace('{icon_name}', icon.name)
            // we always use the LARGE icon scale and resize the icon with the <IconStyle><scale> property in KMLs
            .replace('{icon_scale}', LARGE.iconScale + 'x')
            .replace('{r}', `${rgb[0]}`)
            .replace('{g}', `${rgb[1]}`)
            .replace('{b}', `${rgb[2]}`)
    )
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

/** Offset to apply to an icon when placed on a coordinate ([x,y] format) */
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

interface IconAPIIconSetsResponse {
    items: IconAPIIconSet[]
}

/**
 * Retrieve all available icon sets from the backend.
 *
 * Also retrieve all available icons for those icon sets (so no need to do any additional request to
 * the backend after that)
 */
export async function loadAllIconSetsFromBackend(): Promise<DrawingIconSet[]> {
    const sets: DrawingIconSet[] = []
    try {
        const rawSets = (
            await axios.get<IconAPIIconSetsResponse>(
                `${getViewerDedicatedServicesBaseUrl()}icons/sets`
            )
        ).data.items
        for (const rawSet of rawSets) {
            const iconsURL: string = rawSet.icons_url
            const iconSetName: string = rawSet.name

            sets.push({
                name: iconSetName,
                isColorable: rawSet.colorable,
                iconsURL,
                templateURL: rawSet.template_url,
                hasDescription: rawSet.has_description,
                language: rawSet.language,
                // retrieving all icons for this icon set
                icons: await loadIconsForIconSet(iconsURL, iconSetName),
            })
        }
    } catch (error) {
        log.error({
            title: 'Icon API',
            titleBackgroundColor: LogPreDefinedColor.Lime,
            messages: ['Failed to retrieve icons sets', error],
        })
    }
    return sets
}

interface IconAPIIcon {
    anchor: DrawingIconAnchor
    description: Record<string, string> | null
    name: string
    size: DrawingIconSize
    template_url: string
    url: string
}

interface IconAPIIconsResponse {
    items: IconAPIIcon[]
}

/** Loads all icons from an icon set and attach them to the icon set */
async function loadIconsForIconSet(
    iconSetURL: string,
    iconSetName: string
): Promise<DrawingIcon[]> {
    const icons = []
    try {
        const rawIcons = await axios.get<IconAPIIconsResponse>(iconSetURL)

        icons.push(
            ...rawIcons.data.items.map(
                (rawIcon): DrawingIcon => ({
                    name: rawIcon.name,
                    imageURL: rawIcon.url,
                    imageTemplateURL: rawIcon.template_url,
                    iconSetName,
                    description: rawIcon.description ?? undefined,
                    anchor: rawIcon.anchor,
                    size: rawIcon.size,
                })
            )
        )
    } catch (error) {
        log.error({
            title: 'Icon API',
            titleBackgroundColor: LogPreDefinedColor.Lime,
            messages: ['Error getting icons for icon set', iconSetName, iconSetURL, error],
        })
    }
    return icons
}
