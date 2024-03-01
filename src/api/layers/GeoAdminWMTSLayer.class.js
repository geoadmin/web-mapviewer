import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error.js'
import { CURRENT_YEAR_WMTS_TIMESTAMP } from '@/api/layers/LayerTimeConfigEntry.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { WMTS_BASE_URL } from '@/config.js'

/**
 * Metadata for a tiled image layers (WMTS stands for Web Map Tile Service)
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class GeoAdminWMTSLayer extends GeoAdminLayer {
    /**
     * @param {String} layerData.name Layer name (internationalized)
     * @param {String} layerData.geoAdminId Unique layer ID
     * @param {String} layerData.technicalName ID to be used in our backend (can be different from
     *   the id)
     * @param {Number} [layerData.opacity=1.0] Opacity value between 0.0 (transparent) and 1.0
     *   (visible). Default is `1.0`
     * @param {boolean} [layerData.visible=true] If the layer should be shown on the map. Default is
     *   `true`
     * @param {LayerAttribution[]} [layerData.attributions=[]] Description of the data owner(s) for
     *   this layer. Default is `[]`
     * @param {String} [layerData.format='png'] Image format for this WMTS layer (jpeg or png).
     *   Default is `'png'`
     * @param {LayerTimeConfig | null} [layerData.timeConfig=null] Settings telling which timestamp
     *   has to be used when request tiles to the backend. Default is `null`
     * @param {Boolean} [layerData.isBackground=false] If this layer should be treated as a
     *   background layer. Default is `false`
     * @param {String} layerData.baseUrl The base URL to be used to request tiles (can use the {0-9}
     *   layerData.notation to describe many available backends)
     * @param {Boolean} [layerData.isHighlightable=false] Tells if this layer possess features that
     *   should be highlighted on the map after a click (and if the backend will provide valuable
     *   information on the
     *   {@link http://api3.geo.admin.ch/services/sdiservices.html#identify-features} endpoint).
     *   Default is `false`
     * @param {Boolean} [layerData.hasTooltip=false] Define if this layer shows tooltip when clicked
     *   on. Default is `false`
     * @param {String[]} [layerData.topics=[]] All the topics in which belongs this layer. Default
     *   is `[]`
     * @param {Boolean} [layerData.hasLegend=false] Define if this layer has a legend that can be
     *   shown to users to explain its content. Default is `false`
     * @throws InvalidLayerDataError if no `layerData` is given or if it is invalid
     */
    constructor(layerData) {
        if (!layerData) {
            throw new InvalidLayerDataError('Missing geoadmin WMTS layer data', layerData)
        }
        const {
            name = null,
            geoAdminId = null,
            technicalName = null,
            opacity = 1.0,
            visible = true,
            attributions = [],
            format = 'png',
            timeConfig = null,
            isBackground = false,
            baseUrl = WMTS_BASE_URL,
            isHighlightable = false,
            hasTooltip = false,
            topics = [],
            hasLegend = false,
        } = layerData
        super({
            name,
            type: LayerTypes.WMTS,
            geoAdminId,
            technicalName,
            opacity,
            visible,
            attributions,
            isBackground,
            baseUrl,
            isHighlightable,
            hasTooltip,
            topics,
            hasLegend,
        })
        this.format = format
        this.timeConfig = timeConfig
        this.hasMultipleTimestamps = this.timeConfig?.timeEntries?.length > 1
    }

    clone() {
        const clone = super.clone()
        clone.timeConfig = this.timeConfig?.clone() ?? null
        return clone
    }

    /**
     * @param {Number} epsgNumber The EPSG number of the projection system to use (for instance,
     *   EPSG:2056 will require an input of 2056)
     * @param {String | null} timestamp A timestamp to be used, instead of the one define in the
     *   time config of the layer. Is used to preview a specific timestamp without having to change
     *   the layer's config (very useful for the time slider for instance)
     * @returns {String} A XYZ type URL to request this WMTS layer's tiles
     */
    getURL(epsgNumber, timestamp = null) {
        if (!epsgNumber) {
            throw Error('epsgNumber is required')
        }
        let timestampToUse = timestamp
        if (!timestampToUse || !this.timeConfig.hasTimestamp(timestampToUse)) {
            // if no timestamp was given as param, or if the given timestamp is not part of the possible timestamps
            // we fall back to the timestamp in the time config
            timestampToUse = this.timeConfig.currentTimestamp
        }
        if (!timestampToUse) {
            // if no timestamp was found (no time config or preview year) we fall back to 'current' as the default WMTS timestamp
            timestampToUse = CURRENT_YEAR_WMTS_TIMESTAMP
        }
        return `${this.baseUrl}1.0.0/${this.technicalName}/default/${timestampToUse}/${epsgNumber}/{z}/{x}/{y}.${this.format}`
    }
}
