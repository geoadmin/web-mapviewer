import type { Staging } from '@swissgeo/staging-config'

import log from '@swissgeo/log'
import { getViewerDedicatedServicesBaseUrl } from '@swissgeo/staging-config'
import axios from 'axios'

import type {
    DrawingIcon,
    DrawingIconSet,
    IconAPIIconSetsResponse,
    IconAPIIconsResponse,
} from '@/types/icons'

import LogColorPerService from '@/config/log'

const logConfig = {
    title: 'Icons API',
    titleBackgroundColor: LogColorPerService.icons,
}

const REGEX_COLOR_HEX = /^#[0-9A-F]{6}$/i

function isValidHexColor(color: string): boolean {
    return REGEX_COLOR_HEX.test(color)
}

function convertToRgb(hexColor: string): { r: number; g: number; b: number } {
    if (isValidHexColor(hexColor)) {
        const hexWithoutHash = hexColor.substring(1)
        return {
            r: parseInt(hexWithoutHash.substring(0, 2), 16),
            g: parseInt(hexWithoutHash.substring(2, 4), 16),
            b: parseInt(hexWithoutHash.substring(4), 16),
        }
    }
    return {
        r: 256,
        g: 0,
        b: 0,
    }
}

/**
 * Generate an icon URL from its template. If no iconScale is given, the default scale 1 will be
 * applied. If no iconColor is given, red will be applied (if applicable, as non-colorable icons
 * will not have {r}, {g}, {b} part of their template URL)
 *
 * @returns A full URL to this icon on the service-icons backend
 */
function generateIconURL(icon: DrawingIcon, iconColor: string = '#ff0000') {
    const checkedColor = isValidHexColor(iconColor) ? iconColor : '#ff0000'
    const rgb = convertToRgb(checkedColor)
    return (
        icon.imageTemplateURL
            .replace('{icon_set_name}', icon.iconSetName)
            .replace('{icon_name}', icon.name)
            // we always use the 1x icon scale and resize the icon with the <IconStyle><scale> property in KMLs
            .replace('{icon_scale}', '1x')
            .replace('{r}', `${rgb.r}`)
            .replace('{g}', `${rgb.g}`)
            .replace('{b}', `${rgb.b}`)
    )
}

/**
 * Retrieve all available icon sets from the backend.
 *
 * Also retrieve all available icons for those icon sets (so no need to do any additional request to
 * the backend after that)
 */
async function loadAllIconSetsFromBackend(
    staging: Staging = 'production'
): Promise<DrawingIconSet[]> {
    const sets: DrawingIconSet[] = []
    try {
        const rawSets = (
            await axios.get<IconAPIIconSetsResponse>(
                `${getViewerDedicatedServicesBaseUrl(staging)}icons/sets`
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
            ...logConfig,
            messages: ['Failed to retrieve icons sets', error],
        })
    }
    return sets
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
            ...logConfig,
            messages: ['Error getting icons for icon set', iconSetName, iconSetURL, error],
        })
    }
    return icons
}

export const iconsAPI = {
    generateIconURL,
    loadAllIconSetsFromBackend,
}
export default iconsAPI
