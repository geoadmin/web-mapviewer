import ExternalLayer from '@/api/layers/ExternalLayer.class'
import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/**
 * @readonly
 * @enum {String}
 */
export const WMTSEncodingTypes = {
    KVP: 'KVP',
    REST: 'REST',
}

/**
 * WMTS TileMatrixSet
 *
 * @class
 */
export class TileMatrixSet {
    /**
     * @param {String} id Identifier of the tile matrix set (see WMTS OGC spec)
     * @param {CoordinateSystem} projection Coordinate system supported by the Tile Matrix Set
     * @param {any} tileMatrix TileMatrix from GetCapabilities (see WMTS OGC spec)
     */
    constructor(id, projection, tileMatrix) {
        this.id = id
        this.projection = projection
        this.tileMatrix = tileMatrix
    }
}

/**
 * A WMTS Layer dimension
 *
 * See WMTS OGC Spec
 *
 * @class
 */
export class WMTSDimension {
    /**
     * @param {String} id Dimension identifier
     * @param {String} dft Dimension default value
     * @param {[String]} values All dimension values
     * @param {Boolean} [optionals.current] Boolean flag if the dimension support current (see WMTS
     *   OGC spec)
     */
    constructor(id, dft, values, optionals = {}) {
        const { current = false } = optionals
        this.id = id
        this.default = dft
        this.values = values
        this.current = current
    }
}

/**
 * Metadata for an external WMTS layer, that will be defined through a GetCapabilities.xml endpoint
 * (and a layer ID)
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class ExternalWMTSLayer extends ExternalLayer {
    /**
     * @param {String} externalWmtsData.id Layer ID to use when requesting the tiles on the server
     * @param {String} externalWmtsData.name Name of this layer to be shown to the user
     * @param {number} [externalWmtsData.opacity=1.0] The opacity of this layer, between 0.0
     *   (transparent) and 1.0 (opaque). Default is `1.0`
     * @param {boolean} [externalWmtsData.visible=true] If the layer should be shown on the map or
     *   be hidden. Default is `true`
     * @param {String} externalWmtsData.baseUrl To the getCapabilities.xml endpoint of the server
     *   for this layer
     * @param {LayerAttribution[]} [externalWmtsData.attributions=null] Description of the data
     *   owner(s) for this layer. When `null` is given it uses the default attribution which is
     *   based on the hostname of the GetCapabilities server. Default is `null`
     * @param {String} [externalWmtsData.abstract=''] Abstract of this layer to be shown to the
     *   user. Default is `''`
     * @param {[[number, number], [number, number]] | null} [externalWmtsData.extent=null] Layer
     *   extent. Default is `null`
     * @param {[LayerLegend]} [externalWmtsData.legends=[]] Layer legends. Default is `[]`
     * @param {boolean} [externalWmtsData.isLoading=true] Set to true if some parts of the layer
     *   (e.g. metadata) are still loading. Default is `true`
     * @param {CoordinateSystem[]} [externalWmtsData.availableProjections=[]] All projection that
     *   can be used to request this layer. Default is `[]`
     * @param {ol/WMTS/Options} [externalWmtsData.options] WMTS Get Capabilities options
     * @param {String} [externalWmtsData.getTileEncoding=REST] WMTS Get Tile encoding (KVP or REST).
     *   Default is `REST`
     * @param {String | null} [externalWmtsData.urlTemplate=''] WMTS Get Tile url template for REST
     *   encoding. Default is `''`
     * @param {String} [externalWmtsData.style='default'] WMTS layer style. Default is `'default'`
     * @param {[TileMatrixSet]} [externalWmtsData.tileMatrixSets=[]] WMTS tile matrix sets
     *   identifiers. Default is `[]`
     * @param {[WMTSDimension]} [externalWmtsData.dimensions=[]] WMTS tile dimensions. Default is
     *   `[]`
     * @param {LayerTimeConfig | null} [externalWmtsData.timeConfig=null] Time series config (if
     *   available). Default is `null`
     * @param {Number} [externalWmtsData.currentYear=null] Current year of the time series config to
     *   use. This parameter is needed as it is set in the URL while the timeConfig parameter is not
     *   yet available and parse later on from the GetCapabilities. Default is `null`
     * @throws InvalidLayerDataError if no `externalWmtsData` is given or if it is invalid
     */
    constructor(externalWmtsData) {
        if (!externalWmtsData) {
            throw new InvalidLayerDataError('Missing external WMTS layer data', externalWmtsData)
        }
        const {
            id = null,
            name = null,
            opacity = 1.0,
            visible = true,
            baseUrl = null,
            attributions = null,
            abstract = '',
            extent = null,
            legends = [],
            isLoading = true,
            availableProjections = [],
            options = null,
            getTileEncoding = WMTSEncodingTypes.REST,
            urlTemplate = '',
            style = 'default',
            tileMatrixSets = [],
            dimensions = [],
            timeConfig = null,
            currentYear = null,
        } = externalWmtsData
        super({
            name,
            id,
            type: LayerTypes.WMTS,
            baseUrl,
            ensureTrailingSlashInBaseUrl: true,
            opacity,
            visible,
            attributions,
            abstract,
            extent,
            legends,
            isLoading,
            availableProjections,
            timeConfig,
            currentYear,
        })
        this.options = options
        this.getTileEncoding = getTileEncoding
        this.urlTemplate = urlTemplate
        this.style = style
        this.tileMatrixSets = tileMatrixSets
        this.dimensions = dimensions
    }
}
