import log, { LogPreDefinedColor } from '@swissgeo/log'
import axios from 'axios'
import { fromString } from 'ol/color'

import type {
    DrawingIcon,
    DrawingIconAnchor,
    DrawingIconSet,
    DrawingIconSize,
    IconAPIIconSetsResponse,
} from '@/api/icons/types'
import type { FeatureStyleColor, FeatureStyleSize } from '@/utils/featureStyle/types'

import { getViewerDedicatedServicesBaseUrl } from '@/config/baseUrl.config'
import { LARGE, RED } from '@/utils/featureStyle'

/**
 * Generate an icon URL from its template. If no iconScale is given, the default scale 1 will be
 * applied. If no iconColor is given, red will be applied (if applicable, as non-colorable icons
 * will not have {r}, {g}, {b} part of their template URL)
 *
 * @returns A full URL to this icon on the service-icons backend
 */
export function generateIconURL(
    icon: DrawingIcon,
    iconColor: FeatureStyleColor = RED,
    iconSize: FeatureStyleSize = LARGE
) {
    const rgb = fromString(iconColor.fill)
    return icon.imageTemplateURL
        .replace('{icon_set_name}', icon.iconSetName)
        .replace('{icon_name}', icon.name)
        .replace('{icon_scale}', iconSize.iconScale + 'x')
        .replace('{r}', `${rgb[0]}`)
        .replace('{g}', `${rgb[1]}`)
        .replace('{b}', `${rgb[2]}`)
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
