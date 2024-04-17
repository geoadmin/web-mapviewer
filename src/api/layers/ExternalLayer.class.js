import AbstractLayer, { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'

/**
 * Information required to create a GetFeatureInfo request to this external WM(T)S server. This
 * enables us to identify features at a mouse click.
 *
 * @property {String} baseUrl Base WMS URL to use to create the GetFeatureInfo WM(T)S request
 *   (adding a ? and all necessary query params after the base URL)
 * @property {'GET' | 'POST'} method HTTP method to use when requesting this server
 * @property {String[]} formats Available formats in which the server can respond
 *
 * @typedef ExternalLayerGetFeatureInfoCapability
 */

/**
 * External Layer Legend
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export class LayerLegend {
    /**
     * @param {String} layerLegendData.url Legend URL
     * @param {String} layerLegendData.format Legend MIME type
     * @param {number | null} [layerLegendData.width=null] Width of the legend image (in case the
     *   format is an image format). Default is `null`
     * @param {number | null} [layerLegendData.height=null] Height of the legend image (in case the
     *   format is an image format). Default is `null`
     * @throws InvalidLayerDataError if no `layerLegendData` is given or if it is invalid
     */
    constructor(layerLegendData) {
        if (!layerLegendData) {
            throw new InvalidLayerDataError('Missing legend data')
        }
        const { url, format, width = null, height = null } = layerLegendData
        if (!url) {
            throw new InvalidLayerDataError('Missing legend URL', layerLegendData)
        }
        if (!format) {
            throw new InvalidLayerDataError('Missing legend format', layerLegendData)
        }
        this.url = url
        this.format = format
        this.width = width
        this.height = height
    }
}

/**
 * Base for all external layers, defining a flag to differentiate them from GeoAdminLayers
 *
 * @abstract
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class ExternalLayer extends AbstractLayer {
    /**
     * @param {String} externalLayerData.name Name of this layer to be shown to the user
     * @param {String} externalLayerData.id Layer ID to use when requesting the tiles on the server
     * @param {LayerTypes} externalLayerData.type The type of layer in GeoAdmin sense (WMTS, WMS,
     *   GeoJson, etc...)
     * @param {String} externalLayerData.baseUrl Base URL to build the request to the data
     * @param {number} [externalLayerData.opacity=1.0] The opacity of this layer, between 0.0
     *   (transparent) and 1.0 (opaque). Default is `1.0`
     * @param {boolean} [externalLayerData.visible=true] If the layer should be visible on the map.
     *   Default is `true`
     * @param {LayerAttribution[]} [externalLayerData.attributions=null] Description of the data
     *   owner(s) for this layer. When `null` is given it uses the default attribution which is
     *   based on the hostname of the GetCapabilities server. Default is `null`
     * @param {String} [externalLayerData.abstract=''] Abstract of this layer to be shown to the
     *   user. Default is `''`
     * @param {[[number, number], [number, number]] | null} [externalLayerData.extent=null] Layer
     *   extent. Default is `null`
     * @param {[LayerLegend]} [externalLayerData.legends=[]] Layer legends. Default is `[]`
     * @param {boolean} [externalLayerData.isLoading=true] Set to true if some parts of the layer
     *   (e.g. metadata) are still loading. Default is `true`
     * @param {CoordinateSystem[]} [externalLayerData.availableProjections=[]] All projection that
     *   can be used to request this layer. Default is `[]`
     * @param {boolean} [externalLayerData.hasTooltip=false] Flag telling if this layer can be used
     *   in a GetFeatureInfo request. Default is `false`
     * @param {ExternalLayerGetFeatureInfoCapability | null} [externalLayerData.getFeatureInfoCapability=null]
     *   Configuration describing how to request this layer's server to get feature information.
     *   Default is `null`
     * @throws InvalidLayerDataError if no `externalLayerData` is given or if it is invalid
     */
    constructor(externalLayerData) {
        if (!externalLayerData) {
            throw new InvalidLayerDataError('Missing external layer data', externalLayerData)
        }
        const {
            name = null,
            id = null,
            type = null,
            baseUrl = null,
            opacity = 1.0,
            visible = true,
            attributions = null,
            abstract = '',
            extent = null,
            legends = [],
            isLoading = true,
            availableProjections = [],
            hasTooltip = false,
            getFeatureInfoCapability = null,
        } = externalLayerData
        // keeping this checks, even though it will be checked again by the super constructor, because we use the baseUrl
        // to build our call to the super constructor (with a URL construction, which could raise an error if baseUrl is
        // not defined)
        if (baseUrl === null) {
            throw new InvalidLayerDataError('Missing external layer base URL', externalLayerData)
        }
        super({
            name,
            id,
            type,
            baseUrl,
            opacity,
            visible,
            attributions: attributions ?? [new LayerAttribution(new URL(baseUrl).hostname)],
            hasTooltip,
            isExternal: true,
            isLoading,
            hasDescription: abstract?.length > 0 || legends?.length > 0,
            hasLegend: legends?.length > 0,
        })
        this.abstract = abstract
        this.extent = extent
        this.legends = legends
        this.availableProjections = [...availableProjections]
        if (this.availableProjections.length === 0) {
            log.error(
                'No supported projection found within external layer config, falling back to WGS84',
                externalLayerData
            )
            this.availableProjections.push(WGS84)
        }
        this.getFeatureInfoCapability = getFeatureInfoCapability
    }
}
