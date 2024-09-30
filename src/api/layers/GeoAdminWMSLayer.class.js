import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { getWmsBaseUrl } from '@/config/baseUrl.config'

/**
 * Metadata for WMS layer (WMS stands for Web Map Service). It can either be tiled (requested in
 * chunks, usually 4), or single image (only one request fired for the whole map).
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class GeoAdminWMSLayer extends GeoAdminLayer {
    /**
     * @param {String} layerData.name The name of this layer (lang specific)
     * @param {String} layerData.id The unique ID of this layer
     * @param {String | null} layerData.idIn3d The layer ID to be used as substitute for this layer
     *   when we are showing the 3D map. Will be using the same layer if this is set to null.
     * @param {String | null} layerData.idInVectorTile The layer ID to be used as substitute for
     *   this layer when we are showing the map with vector tiles. Will be using the same layer if
     *   this is set to null.
     * @param {String} layerData.technicalName The ID/name to use when requesting the WMS backend,
     *   this might be different than id, and many layers (with different id) can in fact request
     *   the same layer, through the same technical name, in the end)
     * @param {Number} [layerData.opacity=1.0] The opacity to apply to this layer (between 0.0 and
     *   1.0). Default is `1.0`
     * @param {boolean} [layerData.visible=true] If the layer should be shown on the map. Default is
     *   `true`
     * @param {LayerAttribution[]} layerData.attributions Description of the data owner(s) for this
     *   layer
     * @param {String} [layerData.baseUrl=WMS_BASE_URL] The backend to call for tiles. Default is
     *   `WMS_BASE_URL`
     * @param {String} [layerData.format='png'] In which image format the backend must be requested.
     *   Default is `'png'`
     * @param {LayerTimeConfig | null} [layerData.timeConfig=null] Settings telling which year has
     *   to be used when request tiles to the backend. Default is `null`
     * @param {String} [layerData.lang='en'] The lang ISO code to use when requesting the backend
     *   (WMS images can have text that are language dependent). Default is `'en'`
     * @param {Number} [layerData.gutter=0] How much of a gutter (extra pixels around the image) we
     *   want. This is specific for tiled WMS, if unset this layer will be a considered a single
     *   tile WMS. Default is `0`
     * @param {Boolean} [layerData.isHighlightable=false] Tells if this layer possess features that
     *   should be highlighted on the map after a click (and if the backend will provide valuable
     *   information on the
     *   {@link http://api3.geo.admin.ch/services/sdiservices.html#identify-features} endpoint).
     *   Default is `false`
     * @param {Boolean} [layerData.hasTooltip=false] Define if this layer shows tooltip when clicked
     *   on. Default is `false`
     * @param {String[]} [layerData.topics=[]] All the topics in which belongs this layer. Default
     *   is `[]`
     * @param {String} [layerData.wmsVersion='1.3.0'] Version of the WMS protocol to use while
     *   requesting images on this layer. Default is `'1.3.0'`
     * @param {Boolean} [layerData.hasLegend=false] Define if this layer has a legend that can be
     *   shown to users to explain its content. Default is `false`
     * @param {Boolean} [layerData.searchable=false] Define if this layer's features can be searched
     *   through the search bar. Default is `false`
     * @param {Object | null} [layerData.customAttributes=null] The custom attributes (except the
     *   well known updateDelays, adminId, features and year) passed with the layer id in url.
     *   Default is `null`
     * @throws InvalidLayerDataError if no `layerData` is given or if it is invalid
     */
    constructor(layerData) {
        if (!layerData) {
            throw new InvalidLayerDataError('Missing geoadmin WMS layer data', layerData)
        }
        const {
            name = null,
            id = null,
            idIn3d = null,
            idInVectorTile = null,
            technicalName = null,
            opacity = 1.0,
            visible = true,
            attributions = null,
            baseUrl = getWmsBaseUrl(),
            format = 'png',
            timeConfig = null,
            wmsVersion = '1.3.0',
            lang = 'en',
            gutter = 0,
            isHighlightable = false,
            hasTooltip = false,
            topics = [],
            hasLegend = false,
            searchable = false,
            customAttributes = null,
        } = layerData
        super({
            name,
            type: LayerTypes.WMS,
            id,
            idIn3d,
            idInVectorTile,
            technicalName,
            opacity,
            visible,
            attributions,
            baseUrl,
            isHighlightable,
            hasTooltip,
            topics,
            // for WMS we do not want a trailing slash in the base URL in case the URL is already defined past the ? portion
            ensureTrailingSlashInBaseUrl: false,
            timeConfig,
            hasLegend,
            searchable,
            customAttributes,
        })
        this.format = format
        this.lang = lang
        this.gutter = gutter
        this.wmsVersion = wmsVersion
    }
}
