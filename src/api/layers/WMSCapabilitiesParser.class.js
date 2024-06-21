import { range } from 'lodash'
import { WMSCapabilities } from 'ol/format'
import proj4 from 'proj4'

import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
import { LayerLegend } from '@/api/layers/ExternalLayer.class'
import ExternalWMSLayer, { WMSDimension } from '@/api/layers/ExternalWMSLayer.class'
import { CapabilitiesError } from '@/api/layers/layers-external.api'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import LayerTimeConfigEntry from '@/api/layers/LayerTimeConfigEntry.class'
import { WMS_SUPPORTED_VERSIONS } from '@/config'
import allCoordinateSystems, { WGS84 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'

function findLayer(layerId, startFrom, parents) {
    let found = {}
    const layers = startFrom

    for (let i = 0; i < layers?.length && !found.layer; i++) {
        if (layers[i]?.Name === layerId || layers[i]?.Title === layerId) {
            found.layer = layers[i]
            found.parents = parents
        } else if (layers[i]?.Layer?.length > 0) {
            found = findLayer(layerId, layers[i]?.Layer, [layers[i], ...parents])
        }
    }
    return found
}

/** Wrapper around the OpenLayer WMSCapabilities to add more functionalities */
export default class WMSCapabilitiesParser {
    constructor(content, originUrl) {
        const parser = new WMSCapabilities()
        try {
            Object.assign(this, parser.read(content))
        } catch (error) {
            log.error(`Failed to parse capabilities of ${originUrl}`, error)
            throw new CapabilitiesError(
                `Failed to parse WMTS Capabilities: invalid content: ${error}`,
                'invalid_wms_capabilities'
            )
        }

        this.originUrl = new URL(originUrl)
    }

    /**
     * Returns information about where feature identification can be accessed, or null if this WMS
     * has no such capabilities
     *
     * @param {boolean} ignoreError
     * @returns {null | ExternalLayerGetFeatureInfoCapability}
     * @see https://www.mediamaps.ch/ogc/schemas-xsdoc/sld/1.2/capabilities_1_3_0_xsd.html#Capability
     */
    getFeatureInfoCapability(ignoreError = true) {
        if (Array.isArray(this.Capability?.Request?.GetFeatureInfo?.DCPType)) {
            const httpElement = this.Capability.Request.GetFeatureInfo?.DCPType[0].HTTP
            let baseUrl = null
            let method = 'GET'
            if (httpElement?.Get) {
                baseUrl = httpElement.Get.OnlineResource
            } else if (httpElement?.Post) {
                method = 'POST'
                baseUrl = httpElement.Post.OnlineResource
            } else {
                log.error(
                    "Couldn't parse GetFeatureInfo data",
                    this.Capability.Request.GetFeatureInfo
                )
                if (ignoreError) {
                    return null
                }
                throw new CapabilitiesError(
                    'Invalid GetFeatureInfo data',
                    'invalid_get_feature_info'
                )
            }
            const formats = []
            if (this.Capability.Request.GetFeatureInfo.Format) {
                formats.push(...this.Capability.Request.GetFeatureInfo.Format)
            }
            return {
                baseUrl,
                method,
                formats,
            }
        }
        return null
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
        return findLayer(layerId, [this.Capability.Layer], [this.Capability.Layer])
    }

    /**
     * Get ExternalWMSLayer object from capabilities for the given layer ID
     *
     * @param {string} layerId Layer ID of the layer to retrieve
     * @param {CoordinateSystem} projection Projection currently used by the application
     * @param {number} [opacity=1] Default is `1`
     * @param {boolean} [visible=true] Default is `true`
     * @param {Number | null} [currentYear=null] Current year to select for the time config. Only
     *   needed when a time config is present a year is pre-selected in the url parameter. Default
     *   is `null`
     * @param {boolean} [ignoreError=true] Don't throw exception in case of error, but return a
     *   default value or null. Default is `true`
     * @returns {ExternalWMSLayer | null} ExternalWMSLayer object or null in case of error
     */
    getExternalLayerObject(
        layerId,
        projection,
        opacity = 1,
        visible = true,
        currentYear = null,
        ignoreError = true
    ) {
        const { layer, parents } = this.findLayer(layerId)
        if (!layer) {
            const msg = `No WMS layer ${layerId} found in Capabilities ${this.originUrl.toString()}`
            log.error(msg, this)
            if (ignoreError) {
                return null
            }
            throw new CapabilitiesError(msg, 'no_layer_found')
        }
        return this._getExternalLayerObject(
            layer,
            parents,
            projection,
            opacity,
            visible,
            currentYear,
            ignoreError
        )
    }

    /**
     * Get all ExternalWMSLayer objects from capabilities
     *
     * @param {CoordinateSystem} projection Projection currently used by the application
     * @param {number} opacity
     * @param {boolean} visible
     * @param {Number | null} [currentYear=null] Current year to select for the time config. Only
     *   needed when a time config is present a year is pre-selected in the url parameter. Default
     *   is `null`
     * @param {boolean} ignoreError Don't throw exception in case of error, but return a default
     *   value or null
     * @returns {[ExternalWMSLayer | ExternalGroupOfLayers]} List of
     *   ExternalWMSLayer|ExternalGroupOfLayers objects
     */
    getAllExternalLayerObjects(
        projection,
        opacity = 1,
        visible = true,
        currentYear = null,
        ignoreError = true
    ) {
        return this.Capability.Layer.Layer.map((layer) =>
            this._getExternalLayerObject(
                layer,
                [this.Capability.Layer],
                projection,
                opacity,
                visible,
                currentYear,
                ignoreError
            )
        ).filter((layer) => !!layer)
    }

    _getExternalLayerObject(
        layer,
        parents,
        projection,
        opacity,
        visible,
        currentYear,
        ignoreError
    ) {
        const {
            layerId,
            title,
            url,
            version,
            abstract,
            attributions,
            extent,
            legends,
            queryable,
            availableProjections,
            dimensions,
        } = this._getLayerAttributes(layer, parents, projection, ignoreError)

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
            return new ExternalGroupOfLayers({
                id: layerId,
                name: title,
                opacity,
                visible,
                baseUrl: url,
                layers,
                attributions,
                abstract,
                extent,
                legends,
                isLoading: false,
                availableProjections,
                getFeatureInfoCapability: this.getFeatureInfoCapability(ignoreError),
                currentYear,
            })
        }
        return new ExternalWMSLayer({
            id: layerId,
            name: title,
            opacity,
            visible,
            baseUrl: url,
            attributions,
            wmsVersion: version,
            format: 'png',
            abstract,
            extent,
            legends,
            isLoading: false,
            availableProjections,
            hasTooltip: queryable,
            getFeatureInfoCapability: this.getFeatureInfoCapability(ignoreError),
            currentYear,
            dimensions: dimensions,
            timeConfig: this._getTimeConfig(layerId, dimensions),
        })
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
            throw new CapabilitiesError(msg, 'no_layer_found')
        }

        if (!this.version || !WMS_SUPPORTED_VERSIONS.includes(this.version)) {
            let msg = ''
            if (!this.version) {
                msg = `No WMS version found in Capabilities of ${this.originUrl.toString()}`
            } else {
                msg = `WMS version ${this.version} of ${this.originUrl.toString()} not supported`
            }
            log.error(msg, layer)
            if (ignoreError) {
                return {}
            }
            throw new CapabilitiesError(msg, 'no_wms_version_found')
        }

        // by default, WGS84 must be supported
        let availableProjections = [WGS84]
        if (layer.CRS) {
            availableProjections = layer.CRS.filter((crs) =>
                allCoordinateSystems.some((projection) => projection.epsg === crs.toUpperCase())
            ).map((crs) =>
                allCoordinateSystems.find((projection) => projection.epsg === crs.toUpperCase())
            )
        }
        // filtering out double inputs
        availableProjections = [...new Set(availableProjections)]
        if (availableProjections.length === 0) {
            const msg = `No projections found for layer ${layerId}`
            if (!ignoreError) {
                throw new CapabilitiesError(msg)
            } else {
                log.error(msg, layer)
            }
        }

        return {
            layerId,
            title: layer.Title,
            url:
                this.Capability?.Request?.GetMap?.DCPType[0]?.HTTP?.Get?.OnlineResource ||
                this.originUrl.toString(),
            version: this.version,
            abstract: layer.Abstract,
            attributions: this._getLayerAttribution(layerId, layer),
            extent: this._getLayerExtent(layerId, layer, parents, projection),
            legends: this._getLayerLegends(layerId, layer),
            queryable: layer.queryable,
            availableProjections,
            dimensions: this._getDimensions(layerId, layer),
        }
    }

    _getLayerExtent(layerId, layer, parents, projection) {
        // TODO PB-243 handling of extent out of projection bound (currently not properly handled)
        // - extent totally out of projection bounds
        //    => return null and set outOfBounds flag to true
        // - extent totally inside of projection bounds
        //   => crop extent and set outOfBounds flag to true
        // - extent partially inside projection bounds
        //   => take intersect extent and set outOfBounds flag to true
        // - no extent
        //   => return null and set the outOfBounds flag to false (we don't know)
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
            return this._getLayerExtent(layerId, parents[0], parents.slice(1), projection)
        }

        if (!layerExtent) {
            const msg = `No layer extent found for ${layerId} in ${this.originUrl.toString()}`
            log.error(msg, layer, parents)
        }

        return layerExtent
    }

    _getLayerAttribution(layerId, layer) {
        let title = null
        let url = null
        try {
            if (layer.Attribution || this.Capability.Layer.Attribution) {
                const attribution = layer.Attribution || this.Capability.Layer.Attribution
                url = attribution.OnlineResource
                title = attribution.Title || new URL(attribution.OnlineResource).hostname
            } else {
                title = this.Service?.Title || new URL(this.Service?.OnlineResource).hostname
            }
        } catch (error) {
            const msg = `Failed to get an attribution title/url for ${layerId}: ${error}`
            log.error(msg, layer, error)
            title = new URL(this.originUrl).hostname
            url = null
        }

        return [new LayerAttribution(title, url)]
    }

    _getLayerLegends(layerId, layer) {
        const styles = layer.Style?.filter((s) => s.LegendURL?.length > 0) ?? []
        return styles
            .map((style) =>
                style.LegendURL.map((legend) => {
                    const width = legend.size?.length >= 2 ? legend.size[0] : null
                    const height = legend.size?.length >= 2 ? legend.size[1] : null
                    return new LayerLegend({
                        url: legend.OnlineResource,
                        format: legend.Format,
                        width,
                        height,
                    })
                })
            )
            .flat()
    }

    _parseDimesionValues(layerId, rawValues) {
        const parseYear = (value) => {
            const date = new Date(value)
            if (!isNaN(date)) {
                return date.getFullYear()
            }
            return null
        }
        return rawValues
            .split(',')
            .map((v) => {
                if (v.includes('/')) {
                    const [min, max, res] = v.split('/')
                    const minYear = parseYear(min)
                    const maxYear = parseYear(max)
                    if (minYear === null || maxYear === null) {
                        log.warn(
                            `Unsupported dimension min/max value "${min}"/"${max}" for layer ${layerId}`
                        )
                        return null
                    }
                    let step = 1
                    const periodMatch = /P(\d+)Y/.exec(res)
                    if (periodMatch) {
                        step = periodMatch[1]
                    } else {
                        log.warn(
                            `Unsupported dimension resolution "${res}" for layer ${layerId}, fallback to 1 year period`
                        )
                    }
                    return range(minYear, maxYear, step)
                }
                return v
            })
            .flat()
            .filter((v) => !!v)
            .map((v) => `${v}`)
    }

    _getDimensions(layerId, layer) {
        return (
            layer.Dimension?.map(
                (d) =>
                    new WMSDimension(
                        d.name,
                        d.default,
                        this._parseDimesionValues(layerId, d.values ?? ''),
                        {
                            current: d.current ?? false,
                        }
                    )
            ) ?? []
        )
    }

    _getTimeConfig(layerId, dimensions) {
        const timeDimension = dimensions.find((d) => d.id.toLowerCase() === 'time')
        if (!timeDimension) {
            return null
        }
        const timeEntries =
            timeDimension.values?.map((value) => new LayerTimeConfigEntry(value)) ?? []
        return new LayerTimeConfig(timeDimension.default ?? null, timeEntries)
    }
}
