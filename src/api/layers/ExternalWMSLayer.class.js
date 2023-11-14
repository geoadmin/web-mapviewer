import ExternalLayer from '@/api/layers/ExternalLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { LayerAttribution } from '@/api/layers/AbstractLayer.class'

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
        attributions,
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
     * Parse attributions string from layer ID
     *
     * @param {string} layerIdAttributions Attributions part of the layer ID to parse
     * @returns {[LayerAttribution]} List of layer Attributions
     */
    static parseAttributions(layerIdAttributions) {
        if (layerIdAttributions) {
            return decodeURIComponent(layerIdAttributions)
                .split(attributionsSeparator)
                .map(
                    (attribution) =>
                        new LayerAttribution(
                            ...attribution
                                .split(attributionSeparator)
                                .map((a) => decodeURIComponent(a))
                        )
                )
        }
        return []
    }

    /**
     * Returns the attributions as ID to be used in the URL parameter
     *
     * @returns {string} Attributions ID
     * @see also parseAttributions() method
     */
    attributionsID() {
        if (this.attributions) {
            return `|${encodeURIComponent(
                this.attributions
                    .map(
                        (attribution) =>
                            `${encodeURIComponent(
                                attribution.name
                            )}${attributionSeparator}${encodeURIComponent(attribution.url)}`
                    )
                    .join(attributionsSeparator)
            )}`
        }
        return ''
    }

    /**
     * Parse a layer ID (from the URL) into an ExternalLayer object
     *
     * @param {ActiveLayerConfig} parsedLayer Active layer config parsed from URL
     * @returns {ExternalLayer} External layer object
     */
    static parseLayerID(parsedLayer) {
        const [
            externalLayerType,
            wmsServerBaseURL,
            wmsLayerIds,
            wmsVersion,
            layerName,
            attributions,
        ] = parsedLayer.id.split('|')
        return new ExternalWMSLayer(
            layerName,
            parsedLayer.opacity,
            parsedLayer.visible,
            wmsServerBaseURL,
            wmsLayerIds,
            ExternalWMSLayer.parseAttributions(attributions),
            wmsVersion
        )
    }
}
