import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import log from '@/utils/logging'
import WMTSCapabilities from 'ol/format/WMTSCapabilities'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import proj4 from 'proj4'

/** Wrapper around the OpenLayer WMSCapabilities to add more functionalities */
export default class WMTSCapabilitiesParser {
    constructor(content, originUrl) {
        const parser = new WMTSCapabilities()
        Object.assign(this, parser.read(content))
        this.originUrl = new URL(originUrl)
    }

    /**
     * Find recursively in the capabilities the matching layer ID node
     *
     * @param {string} layerId Layer ID to search for
     * @returns {WMTSCapabilities.Contents.Layer} Capability layer node
     */
    findLayer(layerId) {
        return this._findLayer(layerId, this.Contents.Layer)
    }

    _findLayer(layerId, startFrom) {
        let layer = null
        const layers = startFrom

        for (let i = 0; i < layers.length && !layer; i++) {
            if (layers[i].Identifier === layerId) {
                layer = layers[i]
            } else if (!layers[i].Identifier && layers[i].Title === layerId) {
                layer = layers[i]
            }
        }
        return layer
    }

    /**
     * Get Layer attributes from the WMTS Capabilities to be used in ExternalWMTSLayer
     *
     * @param {WMTSCapabilities.Contents.Layer} layer WMTS Capabilities layer object
     * @param {CoordinateSystem} projection Projection currently used by the application
     * @param {boolean} ignoreError Don't throw exception in case of error, but return a default
     *   value or null
     * @returns {Object} Layer attributes
     */
    getLayerAttributes(layer, projection, ignoreError = true) {
        let layerId = layer.Identifier
        if (!layerId) {
            // fallback to Title
            layerId = layer.Title
        }
        if (!layerId) {
            const msg = `No layer identifier available`
            log.error(msg, layer)
            if (ignoreError) {
                return {}
            }
            throw new Error(msg)
        }
        const title = layer.Title || layerId

        const getCapUrl =
            this.OperationsMetadata?.GetCapabilities?.DCP?.HTTP?.Get[0]?.href ||
            this.originUrl.toString()

        return {
            layerId: layerId,
            title: title,
            url: getCapUrl,
            version: this.version,
            abstract: layer.Abstract,
            attributions: this.getLayerAttribution(layerId),
            extent: this.getLayerExtent(layerId, layer, projection, ignoreError),
        }
    }

    /**
     * Get ExternalWMTSLayer object from the capabilities for the given layer ID
     *
     * @param {string} layerId WMTS Capabilities layer ID to retrieve
     * @param {CoordinateSystem} projection Projection currently used by the application
     * @param {number} opacity
     * @param {boolean} visible
     * @param {boolean} ignoreError Don't throw exception in case of error, but return a default
     *   value or null
     * @returns {ExternalWMTSLayer | null} ExternalWMTSLayer object
     */
    getExternalLayerObject(layerId, projection, opacity = 1, visible = true, ignoreError = true) {
        const layer = this.findLayer(layerId)
        if (!layer) {
            throw new Error(
                `No WMTS layer ${layerId} found in Capabilities ${this.originUrl.toString()}`
            )
        }
        return this._getExternalLayerObject(layer, projection, opacity, visible, ignoreError)
    }

    /**
     * Get all ExternalWMTSLayer objects from capabilities
     *
     * @param {CoordinateSystem} projection Projection currently used by the application
     * @param {number} opacity
     * @param {boolean} visible
     * @param {boolean} ignoreError Don't throw exception in case of error, but return a default
     *   value or null
     * @returns {[ExternalWMTSLayer]} List of ExternalWMTSLayer objects
     */
    getAllExternalLayerObjects(projection, opacity = 1, visible = true, ignoreError = true) {
        return this.Contents.Layer.map((layer) =>
            this._getExternalLayerObject(layer, projection, opacity, visible, ignoreError)
        ).filter((layer) => !!layer)
    }

    _getExternalLayerObject(layer, projection, opacity, visible, ignoreError) {
        const attributes = this.getLayerAttributes(layer, projection, ignoreError)

        if (!attributes) {
            return null
        }

        return new ExternalWMTSLayer(
            attributes.title,
            opacity,
            visible,
            attributes.url,
            attributes.layerId,
            attributes.attributions,
            attributes.Abstract,
            attributes.extent,
            false
        )
    }

    getLayerExtent(layerId, layer, projection, ignoreError = true) {
        let layerExtent = null
        if (layer.WGS84BoundingBox?.length) {
            const extent = layer.WGS84BoundingBox
            layerExtent = [
                proj4(WGS84.epsg, projection.epsg, [extent[0], extent[1]]),
                proj4(WGS84.epsg, projection.epsg, [extent[2], extent[3]]),
            ]
        }
        if (!layerExtent) {
            const msg = `No layer extent found for ${layerId}`
            log.error(msg, layer)
            if (!ignoreError) {
                throw new Error(msg)
            }
        }
        return layerExtent
    }

    getLayerAttribution(layerId) {
        let title = this.ServiceProvider?.ProviderName
        let url = this.ServiceProvider?.ProviderSite

        if (!title) {
            const msg = `No attribution title for layer ${layerId}`
            log.error(msg)
            title = this.originUrl.hostname
        }
        return [new LayerAttribution(title, url)]
    }
}
