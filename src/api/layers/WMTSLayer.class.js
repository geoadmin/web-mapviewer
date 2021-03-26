import AbstractLayer from '@/api/layers/AbstractLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/** Metadata for a tiled image layers (WMTS stands for Web Map Tile Service) */
export default class WMTSLayer extends AbstractLayer {
    /**
     * @param {String} name Layer name (internationalized)
     * @param {String} id Layer ID in the BOD
     * @param {Number} opacity Opacity value between 0.0 (transparent) and 1.0 (visible)
     * @param {String} format Image format for this WMTS layer (jpeg or png)
     * @param {LayerTimeConfig} timeConfig Settings telling which timestamp has to be used when
     *   request tiles to the backend
     * @param {Boolean} isBackground If this layer should be treated as a background layer
     * @param {String} baseURL The base URL to be used to request tiles (can use the {0-9} notation
     *   to describe many available backends)
     * @param {Boolean} isHighlightable Tells if this layer possess features that should be
     *   highlighted on the map after a click (and if the backend will provide valuable information
     *   on the {@link http://api3.geo.admin.ch/services/sdiservices.html#identify-features} endpoint)
     * @param {Boolean} hasTooltip Define if this layer shows tooltip when clicked on
     * @param {String[]} topics All the topics in which belongs this layer
     */
    constructor(
        name = '',
        id = '',
        opacity = 1.0,
        format = 'png',
        timeConfig = null,
        isBackground = false,
        baseURL = null,
        isHighlightable = false,
        hasTooltip = false,
        topics = []
    ) {
        super(
            name,
            LayerTypes.WMTS,
            id,
            opacity,
            isBackground,
            baseURL,
            isHighlightable,
            hasTooltip,
            topics
        )
        this.format = format
        this.timeConfig = timeConfig
    }

    /** @returns {String} A XYZ type URL to request this WMTS layer's tiles */
    getURL() {
        return `${this.baseURL}1.0.0/${this.id}/default/${this.timeConfig.currentTimestamp}/3857/{z}/{x}/{y}.${this.format}`
    }

    /**
     * Resolve the {x-y} notation used in WMTS URLs and outputs all possible URLs
     *
     * Example : `"https://wmts{1-3}.geo.admin.ch"` will outputs `[ "https://wmts1.geo.admin.ch",
     * "https://wmts3.geo.admin.ch", "https://wmts3.geo.admin.ch" ]`
     *
     * @returns {String[]} All possible backend URLs for this layer
     */
    getURLs() {
        const mainURL = this.getURL()
        const urls = []
        const bracketNotationMatches = /.*{([0-9-]+)}.*/.exec(mainURL)
        if (bracketNotationMatches && bracketNotationMatches.length >= 2) {
            const bracketNotation = {
                start: Number(bracketNotationMatches[1].split('-')[0]),
                end: Number(bracketNotationMatches[1].split('-')[1]),
            }
            for (let i = bracketNotation.start; i < bracketNotation.end; i += 1) {
                urls.push(mainURL.replace(`{${bracketNotation.start}-${bracketNotation.end}}`, i))
            }
            if (urls.length === 0) {
                urls.push(mainURL)
            }
        } else {
            urls.push(mainURL)
        }
        return urls
    }
}
