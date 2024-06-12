import AbstractLayer from '@/api/layers/AbstractLayer.class'
import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error'

/**
 * @abstract
 * @class GeoAdminLayer Base class for layer coming from our backend, must be extended to a more
 *   specific flavor of Layer (e.g. {@link GeoAdminWMTSLayer}, {@link GeoAdminWMSLayer},
 *   {@link GeoAdminGeoJsonLayer} or {@link GeoAdminAggregateLayer})
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class GeoAdminLayer extends AbstractLayer {
    /**
     * @param {String} layerData.name Name of this layer in the current lang
     * @param {LayerTypes} layerData.type See {@link LayerTypes} geoAdminLayerData.
     * @param {String} layerData.id The unique ID of this layer that will be used to identify this
     *   layer
     * @param {String | null} layerData.idIn3d The layer ID to be used as substitute for this layer
     *   when we are showing the 3D map. Will be using the same layer if this is set to null.
     * @param {String} layerData.technicalName The ID/name to use when requesting the WMS/WMTS
     *   backend, this might be different than id, and many layers (with different id) can in fact
     *   request the same layer, through the same technical name, in the end)
     * @param {Number} [layerData.opacity=1.0] Value from 0.0 to 1.0 telling with which opacity this
     *   layer should be shown on the map. Default is `1.0`
     * @param {boolean} [layerData.visible=true] If the layer should be shown on the map. Default is
     *   `true`
     * @param {LayerAttribution[]} layerData.attributions Description of the data owner(s) for this
     *   layer.
     * @param {Boolean} [layerData.isBackground=false] If this layer is to be used as a background
     *   layer or not (background layer are stored in the background wheel on the side of the UI).
     *   Default is `false`
     * @param {String} layerData.baseUrl What's the backend base URL to use when requesting
     *   tiles/image for this layer, will be used to construct the URL of this layer later on (if
     *   null, the default WMS/WMTS backend URL will be used)
     * @param {Boolean} [layerData.isHighlightable=false] Tells if this layer possess features that
     *   should be highlighted on the map after a click (and if the backend will provide valuable
     *   information on the
     *   {@link http://api3.geo.admin.ch/services/sdiservices.html#identify-features}
     *   geoAdminLayerData. * endpoint). Default is `false`
     * @param {Boolean} [layerData.hasTooltip=false] Define if this layer shows tooltip when clicked
     *   on. Default is `false`
     * @param {String[]} [layerData.topics=[]] All the topics in which belongs this layer. Default
     *   is `[]`
     * @param {boolean} [layerData.ensureTrailingSlashInBaseUrl=false] Flag telling if the base URL
     *   must always have a trailing slash. It might be sometime the case that this is unwanted
     *   (i.e. for an external WMS URL already built past the point of URL params, a trailing slash
     *   would render this URL invalid). Default is `false`
     * @param {boolean} [layerData.isLoading=false] Set to true if some parts of the layer (e.g.
     *   metadata) are still loading. Default is `false`
     * @param {LayerTimeConfig | null} [layerData.timeConfig=null] Time series config (if
     *   available). Default is `null`
     * @param {Boolean} [layerData.hasDescription=true] Define if this layer has a description that
     *   can be shown to users to explain its content. All internal layer (should) have a
     *   description. TODO: update the backend API to return this value. Default is `true`
     * @param {Boolean} [layerData.hasLegend=false] Define if this layer has a legend that can be
     *   shown to users to explain its content. Default is `false`
     * @param {Boolean} [layerData.searchable=false] Define if this layer's features can be searched
     *   through the search bar. Default is `false`
     * @throws InvalidLayerDataError if no `layerData` is given or if it is invalid
     */
    constructor(layerData) {
        if (!layerData) {
            throw new InvalidLayerDataError('Missing geoadmin layer data', layerData)
        }
        const {
            name = null,
            type = null,
            id = null,
            idIn3d = null,
            technicalName = null,
            opacity = 1.0,
            visible = true,
            attributions = null,
            isBackground = false,
            baseUrl = null,
            isHighlightable = false,
            hasTooltip = false,
            topics = [],
            ensureTrailingSlashInBaseUrl = false,
            isLoading = false,
            timeConfig = null,
            hasDescription = true,
            hasLegend = false,
            searchable = false,
        } = layerData
        if (id === null) {
            throw new InvalidLayerDataError('Missing geoadmin layer ID', layerData)
        }
        if (technicalName === null) {
            throw new InvalidLayerDataError('Missing geoadmin layer technical name', layerData)
        }
        if (baseUrl === null) {
            throw new InvalidLayerDataError('Missing geoadmin layer base URL', layerData)
        }
        if (attributions === null || attributions.length === 0) {
            throw new InvalidLayerDataError(
                'A layer attribution is mandatory for GeoAdmin layers',
                layerData
            )
        }
        super({
            name,
            id,
            type,
            baseUrl,
            ensureTrailingSlashInBaseUrl,
            opacity,
            visible,
            attributions,
            hasTooltip,
            isLoading,
            hasDescription,
            hasLegend,
            timeConfig,
        })
        this.technicalName = technicalName
        this.isBackground = isBackground
        this.isHighlightable = isHighlightable
        this.topics = topics
        this.idIn3d = idIn3d
        this.isSpecificFor3D = id.toLowerCase().endsWith('_3d')
        this.searchable = searchable
    }

    /**
     * Returns which topic should be used in URL that needs one topic to be defined (identify or
     * htmlPopup for instance). By default and whenever possible, the viewer should use `ech`. If
     * `ech` is not present in the topics, the first of them should be used to request the backend.
     *
     * @returns {String} The topic to use in request to the backend for this layer
     */
    getTopicForIdentifyAndTooltipRequests() {
        // by default, the frontend should always request `ech`, so if there's no topic that's what we do
        // if there are some topics, we look if `ech` is one of them, if so we return it
        if (this.topics.length === 0 || this.topics.indexOf('ech') !== -1) {
            return 'ech'
        }
        // otherwise we return the first topic to make our backend requests for identify and htmlPopup
        return this.topics[0]
    }

    clone() {
        let clone = super.clone()
        clone.timeConfig = this.timeConfig?.clone() ?? null
        return clone
    }
}
