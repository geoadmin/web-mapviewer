import { WMS_SUPPORTED_VERSIONS } from '@/config'
import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
import allCoordinateSystems, { WGS84 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'
import { WMSCapabilities } from 'ol/format'
import proj4 from 'proj4'

/** Wrapper around the OpenLayer WMSCapabilities to add more functionalities */
export default class WMSCapabilitiesParser {
    constructor(content, originUrl) {
        const parser = new WMSCapabilities()
        try {
            Object.assign(this, parser.read(content))
        } catch (error) {
            log.error(`Failed to parse capabilities of ${originUrl}`, error)
            throw new Error(`Failed to parse WMTS Capabilities: invalid content`)
        }

        this.originUrl = new URL(originUrl)
    }

    /**
     * Find recursively in the capabilities the matching layer ID node
     *
     * @param {string} layerId Layer ID to search for
     * @returns {{
     *     layer: WMSCapabilities.Capability.Layer
     *     parents: [WMSCapabilities.Capability.Layer]
     * }}
     *   Capability layer node and its parents or an empty object if not found
     */
    findLayer(layerId) {
        return this._findLayer(layerId, this.Capability.Layer.Layer, [this.Capability.Layer])
    }

    _findLayer(layerId, startFrom, parents) {
        let found = {}
        const layers = startFrom

        for (let i = 0; i < layers.length && !found.layer; i++) {
            if (layers[i].Name === layerId || layers[i].Title === layerId) {
                found.layer = layers[i]
                found.parents = parents
            } else if (layers[i].Layer?.length > 0) {
                found = this._findLayer(layerId, layers[i].Layer, [layers[i], ...parents])
            }
        }
        return found
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
        const { layer, parents } = this.findLayer(layerId)
        if (!layer) {
            throw new Error(
                `No WMS layer ${layerId} found in Capabilities ${this.originUrl.toString()}`
            )
        }
        return this._getExternalLayerObject(
            layer,
            parents,
            projection,
            opacity,
            visible,
            ignoreError
        )
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
            this._getExternalLayerObject(
                layer,
                [this.Capability.Layer],
                projection,
                opacity,
                visible,
                ignoreError
            )
        ).filter((layer) => !!layer)
    }

    _getExternalLayerObject(layer, parents, projection, opacity, visible, ignoreError) {
        const { layerId, title, url, version, abstract, attributions, extent } =
            this._getLayerAttributes(layer, parents, projection, ignoreError)

        if (!layerId) {
            // without layerId we can do nothing
            return null
        }

        // Go through the child to get valid layers
        if (layer.Layer?.length) {
            const layers = layer.Layer.map((l) =>
                this._getExternalLayerObject(
                    l,
                    [layer, ...parents],
                    projection,
                    opacity,
                    visible,
                    ignoreError
                )
            ).filter((layer) => !!layer)
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

    _getLayerAttributes(layer, parents, projection, ignoreError = true) {
        let layerId = layer.Name
        // Some WMS only have a Title and no Name, therefore in this case take the Title as layerId
        if (!layerId && layer.Title) {
            // if we don't have a name use the title as name
            layerId = layer.Title
        }
        if (!layerId) {
            // Without layerID we cannot use the layer in our viewer
            const msg = `No layerId found in WMS capabilities for layer in ${this.originUrl.toString()}`
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
            attributions: this._getLayerAttribution(layer),
            extent: this._getLayerExtent(layerId, layer, parents, projection, ignoreError),
        }
    }

    _getLayerExtent(layerId, layer, parents, projection, ignoreError = true) {
        let layerExtent = null
        const matchedBbox = layer.BoundingBox?.find((bbox) => bbox.crs === projection.epsg)
        // First try to find a matching extent from the BoundingBox
        if (matchedBbox) {
            layerExtent = [
                [matchedBbox.extent[0], matchedBbox.extent[1]],
                [matchedBbox.extent[2], matchedBbox.extent[3]],
            ]
        }
        // Then try to find a supported CRS extent from the BoundingBox
        if (!layerExtent) {
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
        // Fallback to the EX_GeographicBoundingBox
        if (!layerExtent && layer.EX_GeographicBoundingBox) {
            const bbox = layer.EX_GeographicBoundingBox
            if (projection !== WGS84) {
                layerExtent = [
                    proj4(WGS84.epsg, projection.epsg, [bbox[0], bbox[1]]),
                    proj4(WGS84.epsg, projection.epsg, [bbox[2], bbox[3]]),
                ]
            } else {
                layerExtent = [
                    [bbox[0], bbox[1]],
                    [bbox[2], bbox[3]],
                ]
            }
        }
        // Finally search the extent in the parents
        if (!layerExtent && parents.length > 0) {
            return this._getLayerExtent(
                layerId,
                parents[0],
                parents.slice(1),
                projection,
                ignoreError
            )
        }

        if (!layerExtent) {
            const msg = `No layer extent found for ${layerId} in ${this.originUrl.toString()}`
            log.error(msg, layer, parents)
            if (!ignoreError) {
                throw Error(msg)
            }
        }

        return layerExtent
    }

    _getLayerAttribution(layer) {
        let title = null
        let url = null
        if (layer.Attribution || this.Capability.Layer.Attribution) {
            const attribution = layer.Attribution || this.Capability.Layer.Attribution
            url = attribution.OnlineResource
            title =
                attribution.Title || new URL(attribution.OnlineResource || this.originUrl).hostname
        } else {
            title =
                this.Service?.Title ||
                new URL(this.Service?.OnlineResource || this.originUrl).hostname
        }

        return [new LayerAttribution(title, url)]
    }
}
