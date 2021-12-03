import { API_SERVICES_BASE_URL } from '@/config'
import axios from 'axios'
import log from '@/utils/logging'

export class IconSet {
    constructor(name, isColorable, iconsURL, templateURL) {
        this.name = name
        this.isColorable = isColorable
        this.iconsURL = iconsURL
        this.templateURL = templateURL
        this.icons = []
    }
}

export class Icon {
    constructor(name, imageURL, imageTemplateURL) {
        this.name = name
        this.imageURL = imageURL
        this.imageTemplateURL = imageTemplateURL
    }

    /**
     * Generate an icon URL from its template
     *
     * @param {String} iconSetName Name of the icon set, should come from an {IconSet} directly
     * @param {DrawingStyleSize} iconSize The size (or scale) to use for this icon's URL
     * @param {DrawingStyleColor} iconColor The color to use for this icon's URL
     * @returns {String} A full URL to this icon on the service-icons backend
     */
    generateURL(iconSetName, iconSize, iconColor) {
        const rgb = iconColor.rgb.slice(0, 3)
        return this.imageTemplateURL
            .replace('{icon_set_name}', iconSetName)
            .replace('{icon_name}', this.name)
            .replace('{icon_scale}', iconSize.iconScale + 'x')
            .replace('{r}', rgb[0])
            .replace('{g}', rgb[1])
            .replace('{b}', rgb[2])
    }
}

/**
 * Retrieve all available icon sets from the backend.
 *
 * Also retrieve all available icons for those icon sets (so no need to do any additional request to
 * the backend after that)
 *
 * @returns {Promise<IconSet[]>}
 */
export async function getAllIconSets() {
    const rawSets = (await axios.get(`${API_SERVICES_BASE_URL}icons/sets`)).data.items
    const sets = []
    for (const rawSet of rawSets) {
        const iconSet = new IconSet(
            rawSet.name,
            rawSet.colorable,
            rawSet.icons_url,
            rawSet.template_url
        )
        // retrieving all icons for this icon set
        const icons = await getIcons(iconSet.iconsURL)
        iconSet.icons.push(...icons)
        sets.push(iconSet)
    }
    return sets
}

/**
 * @param {string} url
 * @returns {Promise<Icon[]>}
 */
function getIcons(url) {
    return axios
        .get(url)
        .then((rawIcons) => {
            const icons = []
            rawIcons.data.items.forEach((rawIcon) => {
                icons.push(new Icon(rawIcon.name, rawIcon.url, rawIcon.template_url))
            })
            return icons
        })
        .catch((error) => {
            log('error', 'Error getting icons', url)
            return Promise.reject(error)
        })
}
