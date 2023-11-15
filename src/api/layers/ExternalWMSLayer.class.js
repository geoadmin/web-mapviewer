import ExternalLayer from '@/api/layers/ExternalLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import axios from 'axios'

const attributionsSeparator = ','
const attributionSeparator = ';'

/** Metadata for an external WMS layer. */
export default class ExternalWMSLayer extends ExternalLayer {
    /**
     * @param {String} name Name of this layer to be shown to the user
     * @param {number} opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param {boolean} visible If the layer should be shown on the map
     * @param {String} serverBaseURL Base URL to build WMS requests (no endpoint / URL param
     *   defined)
     * @param {String} layerId Layer ID to use when requesting the tiles on the server
     * @param {String} wmsVersion WMS protocol version to be used when querying this server, default
     *   is 1.3.0
     * @param {LayerAttribution[]} attributions Description of the data owner(s) for this layer
     *   holder (it typically is the hostname of the server for this layer)
     * @param {String} format Image format for this layer, default is PNG
     * @param {String} abstract Abstract of this layer to be shown to the user
     * @param {[[number, number], [number, number]] | undefined} extent Layer extent
     */
    constructor(
        name,
        opacity,
        visible,
        serverBaseURL,
        layerId,
        attributions = [],
        wmsVersion = '1.3.0',
        format = 'png',
        abstract = '',
        extent = undefined
    ) {
        super(
            name,
            LayerTypes.WMS,
            layerId,
            serverBaseURL,
            opacity,
            visible,
            attributions,
            abstract,
            extent
        )
        this.wmsVersion = wmsVersion
        this.format = format
    }

    getID() {
        // format coming from https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
        // base URL and name must be URL encoded (no & signs or other reserved URL chars must pass, or it could break URL param parsing)
        return `WMS|${this.baseURL}|${this.externalLayerId}|${this.wmsVersion}|${
            this.name
        }${this.attributionsID()}`
    }

    /**
     * @param {string} baseUrl
     * @returns {Promise([ExternalWMSLayer|ExternalGroupOfLayers])}
     */
    static async parseGetCapabilities(baseUrl) {
        const getCap = await ExternalLayer.getCapabilities(baseUrl)

        return getCap.Capability.Layer.Layer.map((layer) =>
            ExternalWMSLayer.parseGetCapLayer(getCap, layer)
        )
    }

    /** Read the GetCapabilities of the external WMS endpoint */
    static async getCapabilities(baseUrl) {
        return null
    }

    static getExtentFromGetCap(getCap, layer, projection) {
        let layerExtent = undefined
        if (layer.BoundingBox?.length) {
            const matchedBbox = layer.BoundingBox.find((bbox) => bbox.crs === projection.epsg)
            if (matchedBbox) {
                layerExtent = [
                    [matchedBbox.extent[0], matchedBbox.extent[1]],
                    [matchedBbox.extent[2], matchedBbox.extent[3]],
                ]
            } else {
                const bbox = layer.BoundingBox.find((bbox) =>
                    allCoordinateSystems.find((projection) => projection.epsg === bbox.crs)
                )
                if (bbox) {
                    layerExtent = [
                        proj4(bbox.crs, projection.epsg, [bbox.extent[0], bbox.extent[1]]),
                        proj4(bbox.crs, projection.epsg, [bbox.extent[2], bbox.extent[3]]),
                    ]
                } else {
                    log.error(
                        `No valid bounding box found in GetCapabilities for layer ${name}`,
                        getCap,
                        layer
                    )
                }
            }
        }
        return layerExtent
    }

    static parseGetCapLayer(getCap, layer, projection) {
        // If the WMS layer has no name, it can't be displayed
        let name = layer.Name
        if (!name && layer.Title) {
            // if we don't have a name use the title as name
            name = layer.Title
        }
        if (!name) {
            log.error(`No layer and/or title available`, layer)
            return null
        }
        const wmsUrl = getCap.Capability.Request.GetMap.DCPType[0].HTTP.Get.OnlineResource
        const layerExtent = ExternalWMSLayer.getExtentFromGetCap(getCap, layer)
        const attribution =
            layer.Attribution || getCap.Capability.Layer.Attribution || getCap.Service
        const attributions = [new LayerAttribution(attribution.Title, attribution.OnlineResource)]
        // Go through the child to get valid layers
        if (layer.Layer?.length) {
            const layers = layer.Layer.map((l) =>
                ExternalWMSLayer.parseGetCapLayer(getCap, l, projection)
            )
            return new ExternalGroupOfLayers(
                layer.Title,
                wmsUrl,
                layers,
                attributions,
                layer.Abstract,
                layerExtent
            )
        }
        return new ExternalWMSLayer(
            layer.Title,
            opacity,
            visible,
            wmsUrl,
            name,
            attributions,
            getCap.version,
            'png',
            layer.Abstract,
            layerExtent
        )
    }

    /** Parse GetCapabilities */
}
