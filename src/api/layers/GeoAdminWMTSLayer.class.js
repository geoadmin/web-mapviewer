import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { DEFAULT_GEOADMIN_MAX_WMTS_RESOLUTION, WMTS_BASE_URL } from '@/config'
import { TILEGRID_RESOLUTIONS } from '@/utils/coordinates/SwissCoordinateSystem.class'

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
     * @param {LayerAttribution[]} layerData.attributions Description of the data owner(s) for this
     *   layer.
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
     * @param {Boolean} [layerData.searchable=false] Define if this layer's features can be searched
     *   through the search bar. Default is `false`
     * @param {Number} [layerData.maxResolution=DEFAULT_MAX_GEOADMIN_RESOLUTION] Define the maximum
     *   resolution the layer can reach. Default is `DEFAULT_MAX_GEOADMIN_RESOLUTION`
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
            attributions = null,
            format = 'png',
            timeConfig = null,
            isBackground = false,
            baseUrl = WMTS_BASE_URL,
            isHighlightable = false,
            hasTooltip = false,
            topics = [],
            hasLegend = false,
            searchable = false,
            maxResolution = DEFAULT_GEOADMIN_MAX_WMTS_RESOLUTION,
        } = layerData
        if (!TILEGRID_RESOLUTIONS.includes(maxResolution)) {
            throw new InvalidLayerDataError(
                'max Resolution not part of available resolutions',
                layerData
            )
        }
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
            // as we will be building URL based on / paths with WMTS, we want to make sure the base URL ends with a /
            ensureTrailingSlashInBaseUrl: true,
            isHighlightable,
            hasTooltip,
            topics,
            hasLegend,
            searchable,
            timeConfig,
        })
        this.format = format
        this.maxResolution = maxResolution
    }
}
