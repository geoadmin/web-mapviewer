import axios from 'axios'

import { API_SERVICES_BASE_URL } from '@/config'
import { calculateTextOffset, MEDIUM, RED } from '@/utils/featureStyleUtils'
import log from '@/utils/logging'

/**
 * Default Icon parameters for the URL.
 *
 * NOTE: The size should match the received size for the scale from the backend. It is needed to
 * avoid race condition when exporting/saving KML. Openlayer requires the size to compute the
 * scale.
 *
 * TODO: take the default size from the backend icon API
 */
export const DEFAULT_ICON_URL_PARAMS = {
    scale: 1,
    size: [48, 48],
}

/** Default offset of title for any feature */
export const DEFAULT_TITLE_OFFSET = [0, 0]

/** Default offset of title for the default marker */
export const DEFAULT_MARKER_TITLE_OFFSET = calculateTextOffset(
    MEDIUM.textScale,
    MEDIUM.iconScale,
    [0, 0.875],
    DEFAULT_ICON_URL_PARAMS.size
)

/**
 * Collection of icons belonging to the same "category" (or set).
 *
 * Some sets are colorable, where other aren't
 */
export class DrawingIconSet {
    /**
     * @param {String} name Name of this set in the backend, lower cased
     * @param {Boolean} isColorable Tells if this set's icons can be colored differently (if the
     *   color can be defined in each icon's URL)
     * @param {String} iconsURL URL to the backend endpoint that gives all available icons for this
     *   set
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

    /** @returns {DrawingIcon[]} List of all icons from this icon set */
    get icons() {
        return [...this._icons]
    }
    /**
     * Overwrite all icons of this set with the new ones
     *
     * @param {DrawingIcon[]} newIcons
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
export class DrawingIcon {
    /**
     * @param {String} name Name of this icon in the backend (lower cased)
     * @param {String} imageURL URL to the image of this icon itself (with default size and color)
     * @param {String} imageTemplateURL URL template where size and color can be defined (by
     *   replacing {icon_scale} and {{r},{g},{b}} respectively, see {@link DrawingIcon.generateURL})
     * @param {String} iconSetName Name of the icon set in which belongs this icon (an icon can only
     *   belong to one icon set)
     * @param {Number[]} anchor Offset to apply to this icon when placed on a coordinate ([x,y]
     *   format)
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
     *   and {{r},{g},{b}} respectively, see {@link DrawingIcon.generateURL})
     */
    get imageTemplateURL() {
        return this._imageTemplateURL
    }

    /** @returns {Number[]} Offset to apply to this icon when placed on a coordinate ([x,y] format) */
    get anchor() {
        return this._anchor
    }

    /**
     * @returns {String} Name of the {@link DrawingIconSet} in which belongs this icon (an icon can
     *   only belong to one icon set)
     */
    get iconSetName() {
        return this._iconSetName
    }

    /**
     * @returns {String} Stringified JSON representation of this object. Is called by
     *   {@link ol.format.KML} if this object is part of the properties of a feature.
     */
    get value() {
        return JSON.stringify(this)
    }

    /**
     * Generate an icon URL from its template. If no iconScale is given, default scale 1 will be
     * applied. If no iconColor is given, red will be applied (if applicable, as non-colorable icons
     * will not have {r}, {g}, {b} part of their template URL)
     *
     * @param {FeatureStyleColor} iconColor The color to use for this icon's URL
     * @param {Number} iconScale The scale to use for this icon's URL
     * @returns {String} A full URL to this icon on the service-icons backend
     */
    generateURL(iconColor = RED, iconScale = DEFAULT_ICON_URL_PARAMS.scale) {
        const rgb = iconColor.rgb.slice(0, 3)
        return this._imageTemplateURL
            .replace('{icon_set_name}', this._iconSetName)
            .replace('{icon_name}', this._name)
            .replace('{icon_scale}', iconScale + 'x')
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
 * @returns {Promise<DrawingIconSet[]>}
 */
export async function loadAllIconSetsFromBackend() {
    const setPromises = []
    const sets = []
    try {
        const rawSets = (await axios.get(`${API_SERVICES_BASE_URL}icons/sets`)).data.items
        for (const rawSet of rawSets) {
            const iconSet = new DrawingIconSet(
                rawSet.name,
                rawSet.colorable,
                rawSet.icons_url,
                rawSet.template_url
            )
            // retrieving all icons for this icon set
            setPromises.push(loadIconsForIconSet(iconSet))
            sets.push(iconSet)
        }
        await Promise.all(setPromises)
    } catch (error) {
        log.error(`Failed to retrieve icons sets: ${error}`)
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
                    rawIcon.anchor
                )
        )
    } catch (error) {
        log.error('Error getting icons for icon set', iconSet)
    }
}
