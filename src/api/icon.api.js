import { API_SERVICES_BASE_URL } from '@/config'
import { MEDIUM, RED } from '@/utils/featureStyleUtils'
import log from '@/utils/logging'
import axios from 'axios'

/**
 * Collection of icons belonging to the same "category" (or set).
 *
 * Some sets are colorable, where other aren't
 */
export class IconSet {
    /**
     * @param {String} name Name of this set in the backend, lower cased
     * @param {Boolean} isColorable Tells if this set's icons can be colored differently (if the
     *   color can be defined in each icon's URL)
     * @param {String} iconsURL URL to the backend endpoint that gives all available icons for this set
     * @param {String} templateURL A template URL to access this icon set's metadata
     *   ({icon_set_name} needs to be replaced with this icon set's name)
     */
    constructor(name, isColorable, iconsURL, templateURL) {
        this._name = name
        this._isColorable = isColorable
        this._iconsURL = iconsURL
        this._templateURL = templateURL
        this._icons = []
    }

    /** @returns {String} Name of this set in the backend, lower cased */
    get name() {
        return this._name
    }

    /**
     * @returns {Boolean} Tells if this set's icons can be colored differently (if the color can be
     *   defined in each icon's URL)
     */
    get isColorable() {
        return this._isColorable
    }

    /** @returns {String} URL to the backend endpoint that gives all available icons for this set */
    get iconsURL() {
        return this._iconsURL
    }

    /**
     * @returns {String} A template URL to access this icon set's metadata ({icon_set_name} needs to
     *   be replaced with this icon set's name)
     */
    get templateURL() {
        return this._templateURL
    }

    /** @returns {Icon[]} List of all icons from this icon set */
    get icons() {
        return [...this._icons]
    }
    /**
     * Overwrite all icons of this set with the new ones
     *
     * @param {Icon[]} newIcons
     */
    set icons(newIcons) {
        this._icons = [...newIcons]
    }
}

/**
 * Representation of one icon available in our backend.
 *
 * Each icon has a specific anchor (an offset from the coordinate it is linked to)
 */
export class Icon {
    /**
     * @param {String} name Name of this icon in the backend (lower cased)
     * @param {String} imageURL URL to the image of this icon itself (with default size and color)
     * @param {String} imageTemplateURL URL template where size and color can be defined (by
     *   replacing {icon_scale} and {{r},{g},{b}} respectively, see {@link Icon.generateURL})
     * @param {String} iconSetName Name of the icon set in which belongs this icon (an icon can only
     *   belong to one icon set)
     * @param {Number[]} anchor Offset to apply to this icon when placed on a coordinate ([x,y] format)
     */
    constructor(name, imageURL, imageTemplateURL, iconSetName, anchor) {
        this._name = name
        this._imageURL = imageURL
        this._imageTemplateURL = imageTemplateURL
        this._iconSetName = iconSetName
        this._anchor = anchor
    }

    /** @returns {String} Name of this icon in the backend (lower cased) */
    get name() {
        return this._name
    }

    /** @returns {String} URL to the image of this icon itself (with default size and color) */
    get imageURL() {
        return this._imageURL
    }

    /**
     * @returns {String} URL template where size and color can be defined (by replacing {icon_scale}
     *   and {{r},{g},{b}} respectively, see {@link Icon.generateURL})
     */
    get imageTemplateURL() {
        return this._imageTemplateURL
    }

    /** @returns {Number[]} Offset to apply to this icon when placed on a coordinate ([x,y] format) */
    get anchor() {
        return this._anchor
    }

    /**
     * @returns {String} Name of the {@link IconSet} in which belongs this icon (an icon can only
     *   belong to one icon set)
     */
    get iconSetName() {
        return this._iconSetName
    }

    /**
     * Generate an icon URL from its template. If no iconSize is given, medium scale will be
     * applied. If no iconColor is given, red will be applied (if applicable, as non-colorable icons
     * will not have {r}, {g}, {b} part of their template URL)
     *
     * @param {FeatureStyleSize} iconSize The size (or scale) to use for this icon's URL
     * @param {FeatureStyleColor} iconColor The color to use for this icon's URL
     * @returns {String} A full URL to this icon on the service-icons backend
     */
    generateURL(iconSize = MEDIUM, iconColor = RED) {
        const rgb = iconColor.rgb.slice(0, 3)
        return this._imageTemplateURL
            .replace('{icon_set_name}', this._iconSetName)
            .replace('{icon_name}', this._name)
            .replace('{icon_scale}', iconSize.iconScale + 'x')
            .replace('{r}', `${rgb[0]}`)
            .replace('{g}', `${rgb[1]}`)
            .replace('{b}', `${rgb[2]}`)
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
export async function loadAllIconSetsFromBackend() {
    const rawSets = (
        await axios.get(`${API_SERVICES_BASE_URL}icons/sets`, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
        })
    ).data.items
    const sets = []
    for (const rawSet of rawSets) {
        const iconSet = new IconSet(
            rawSet.name,
            rawSet.colorable,
            rawSet.icons_url,
            rawSet.template_url
        )
        // retrieving all icons for this icon set
        await loadIconsForIconSet(iconSet)

        sets.push(iconSet)
    }
    return sets
}

/**
 * Loads all icons from an icon set and attach them to the icon set
 *
 * @param {IconSet} iconSet
 * @returns {Promise} Promise resolving when all icons have been attached to the icon set
 */
function loadIconsForIconSet(iconSet) {
    return axios
        .get(iconSet.iconsURL, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
        })
        .then((rawIcons) => {
            iconSet.icons = rawIcons.data.items.map(
                (rawIcon) =>
                    new Icon(
                        rawIcon.name,
                        rawIcon.url,
                        rawIcon.template_url,
                        iconSet.name,
                        rawIcon.anchor
                    )
            )
        })
        .catch((error) => {
            log.error('Error getting icons for icon set', iconSet)
            return Promise.reject(error)
        })
}
