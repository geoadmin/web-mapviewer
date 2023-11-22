import { WMS_SUPPORTED_VERSIONS } from '@/config'
import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
import allCoordinateSystems from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'
import { WMSCapabilities } from 'ol/format'
import proj4 from 'proj4'

/** Wrapper around the OpenLayer WMSCapabilities to add more functionalities */
export default class WMSCapabilitiesParser {
    constructor(content, originUrl) {
        const parser = new WMSCapabilities()
        Object.assign(this, parser.read(content))
        this.originUrl = new URL(originUrl)
    }

    /**
     * Find recursively in the capabilities the matching layer ID node
     *
     * @param {string} layerId Layer ID to search for
     * @returns {WMSCapabilities.Capability.Layer} Capability layer node
     */
    findLayer(layerId) {
        return this._findLayer(layerId, this.Capability.Layer.Layer)
    }

    _findLayer(layerId, startFrom) {
        let layer = null
        const layers = startFrom

        for (let i = 0; i < layers.length && !layer; i++) {
            if (layers[i].Name === layerId) {
                layer = layers[i]
            } else if (!layers[i].Name && layers[i].Title === layerId) {
                layer = layers[i]
            } else if (layers[i].Layer?.length > 0) {
                layer = this._findLayer(layerId, layers[i].Layer)
            }
        }
        return layer
    }

    /**
     * Get Layer attributes from the WMS Capabilities to be used in ExternalWMSLayer
     *
     * @param {WMSCapabilities.Layer} layer WMS Capabilities layer object
     * @param {CoordinateSystem} projection Projection currently used by the application
     * @param {boolean} ignoreError Don't throw exception in case of error, but return a default
     *   value or null
     * @returns {Object | null} Layer attributes
     */
    getLayerAttributes(layer, projection, ignoreError = true) {
        let layerId = layer.Name
        // Some WMS only have a Title and no Name, therefore in this case take the Title as layerId
        if (!layerId && layer.Title) {
            // if we don't have a name use the title as name
            layerId = layer.Title
        }
        if (!layerId) {
            const msg = `No layerId found in WMS capabilities for layer`
            log.error(msg, layer)
            if (ignoreError) {
                return {}
            }
            throw new Error(msg)
        }

        if (!this.version) {
            throw new Error(`No WMS version found in Capabilities of ${this.originUrl.toString()}`)
        }
        if (!WMS_SUPPORTED_VERSIONS.includes(this.version)) {
            throw new Error(
                `WMS version ${this.version} of ${this.originUrl.toString()} not supported`
            )
        }
        return {
            layerId: layerId,
            title: layer.Title,
            url:
                this.Capability?.Request?.GetMap?.DCPType[0]?.HTTP?.Get?.OnlineResource ||
                this.originUrl.toString(),
            version: this.version,
            abstract: layer.Abstract,
            attributions: this.getLayerAttribution(layer),
            extent: this.getLayerExtent(layerId, layer, projection, ignoreError),
        }
    }

    /**
     * Get ExternalWMSLayer object from capabilities for the given layer ID
     *
     * @param {string} layerId Layer ID of the layer to retrieve
     * @param {CoordinateSystem} projection Projection currently used by the application
     * @param {number} opacity
     * @param {boolean} visible
     * @param {boolean} ignoreError Don't throw exception in case of error, but return a default
     *   value or null
     * @returns {ExternalWMSLayer | null} ExternalWMSLayer object or nul in case of error
     */
    getExternalLayerObject(layerId, projection, opacity = 1, visible = true, ignoreError = true) {
        const layer = this.findLayer(layerId)
        if (!layer) {
            throw new Error(
                `No WMS layer ${layerId} found in Capabilities ${this.originUrl.toString()}`
            )
        }
        return this._getExternalLayerObject(layer, projection, opacity, visible, ignoreError)
    }

    /**
     * Get all ExternalWMSLayer objects from capabilities
     *
     * @param {CoordinateSystem} projection Projection currently used by the application
     * @param {number} opacity
     * @param {boolean} visible
     * @param {boolean} ignoreError Don't throw exception in case of error, but return a default
     *   value or null
     * @returns {[ExternalWMSLayer | ExternalGroupOfLayers]} List of
     *   ExternalWMSLayer|ExternalGroupOfLayers objects
     */
    getAllExternalLayerObjects(projection, opacity = 1, visible = true, ignoreError = true) {
        return this.Capability.Layer.Layer.map((layer) =>
            this._getExternalLayerObject(layer, projection, opacity, visible, ignoreError)
        ).filter((layer) => !!layer)
    }

    _getExternalLayerObject(layer, projection, opacity, visible, ignoreError) {
        const { layerId, title, url, version, abstract, attributions, extent } =
            this.getLayerAttributes(layer, projection, ignoreError)

        if (!layerId) {
            // without layerId we can do nothing
            return null
        }

        // Go through the child to get valid layers
        if (layer.Layer?.length) {
            const layers = layer.Layer.map((l) =>
                this._getExternalLayerObject(l, projection, opacity, visible, ignoreError)
            )
            return new ExternalGroupOfLayers(
                title,
                opacity,
                visible,
                url,
                layerId,
                layers,
                attributions,
                abstract,
                extent,
                false
            )
        }
        return new ExternalWMSLayer(
            title,
            opacity,
            visible,
            url,
            layerId,
            attributions,
            version,
            'png',
            abstract,
            extent,
            false
        )
    }

    getLayerExtent(layerId, layer, projection, ignoreError = true) {
        let layerExtent = null
        const matchedBbox = layer.BoundingBox?.find((bbox) => bbox.crs === projection.epsg)
        if (matchedBbox) {
            layerExtent = [
                [matchedBbox.extent[0], matchedBbox.extent[1]],
                [matchedBbox.extent[2], matchedBbox.extent[3]],
            ]
        } else {
            const bbox = layer.BoundingBox?.find((bbox) =>
                allCoordinateSystems.find((projection) => projection.epsg === bbox.crs)
            )
            if (bbox) {
                layerExtent = [
                    proj4(bbox.crs, projection.epsg, [bbox.extent[0], bbox.extent[1]]),
                    proj4(bbox.crs, projection.epsg, [bbox.extent[2], bbox.extent[3]]),
                ]
            }
        }

        if (!layerExtent) {
            const msg = `No layer extent found for ${layerId}`
            log.error(msg)
            if (!ignoreError) {
                throw Error(msg)
            }
        }

        return layerExtent
    }

    getLayerAttribution(layer) {
        let title = null
        let url = null
        if (layer.Attribution || this.Capability.Layer.Attribution) {
            const attribution = layer.Attribution || this.Capability.Layer.Attribution
            url = attribution.OnlineResource
            title = attribution.Title || new URL(attribution.OnlineResource).hostname
        } else {
            title = this.Service.Title || new URL(this.Service.OnlineResource).hostname
        }

        return [new LayerAttribution(title, url)]
    }
}
