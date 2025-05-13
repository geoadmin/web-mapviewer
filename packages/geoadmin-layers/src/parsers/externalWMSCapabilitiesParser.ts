// @ts-nocheck
import { allCoordinateSystems, CoordinateSystem, WEBMERCATOR, WGS84 } from '@geoadmin/coordinates'
import log from '@geoadmin/log'
import { range } from 'lodash'
import { default as olWMSCapabilities } from 'ol/format/WMSCapabilities'
import proj4 from 'proj4'

import {
    type LayerAttribution,
    type LayerLegend,
    type ExternalWMSLayer,
    type WMSDimension,
    type BoundingBox,
    WMS_SUPPORTED_VERSIONS,
    type LayerExtent,
} from '@/types/layers'
import { layerUtils } from '@/utils'
import { makeTimeConfig, makeTimeConfigEntry } from '@/utils/timeConfigUtils'
import { CapabilitiesError } from '@/validation'

type WMSBoundingBox = {
    crs: string
    extent: [number, number, number, number]
    res: [number | null, number | null]
}

type LegendURL = { Format: string; size: [number, number]; OnlineResource: string }

type CapabilityLayer = {
    Dimension?: Record<string, any>
    Name: string
    parent: CapabilityLayer
    Title: string
    Layer?: CapabilityLayer[]
    CRS: string[]
    Abstract: string
    queryable: boolean
    WGS84BoundingBox?: { crs: string; dimensions: any }[]
    BoundingBox?: WMSBoundingBox[]
    EX_GeographicBoundingBox: [number, number, number, number]
    Attribution: {
        LogoUrl: {
            Format: string
            OnlineResource: string
            size: [number, number]
        }
        OnlineResource: string
        Title: string
    }
    Style: {
        LegendURL: LegendURL[]
        Identifier: string
        isDefault: boolean
    }[]
}

type Request = {
    DCPType: any[]
    Format: string[]
}

export type WMSCapabilities = {
    originUrl: URL
    version: string
    Capability?: {
        Layer?: CapabilityLayer
        TileMatrixSet: Array<{
            BoundingBox: BoundingBox[]
            Identifier: string
            SupportedCRS?: string
            TileMatrix: Object[]
        }>
        Request: {
            GetCapabilities: Request
            GetFeatureInfo: Request
            GetMap: Request
        }
    }
    ServiceProvider?: {
        ProviderName?: string
        ProviderSite?: string
    }
    OperationsMetadata?: Record<string, any>
    Service: {
        Title: string
        OnlineResource: string
    }
}

function findLayer(layerId: string, layers: CapabilityLayer[], parents: CapabilityLayer[]) {
    let found: {
        layer?: CapabilityLayer
        parents?: CapabilityLayer[]
    } = {}

    for (let i = 0; i < layers?.length && !found.layer; i++) {
        if (layers[i]?.Name === layerId || layers[i]?.Title === layerId) {
            found.layer = layers[i]
            found.parents = parents
        } else if ((layers[i]?.Layer ?? []).length > 0) {
            found = findLayer(layerId, layers[i]?.Layer!, [layers[i], ...parents])
        }
    }
    return found
}

// Return the common projections of all sub layers if the main layer doesn't have any CRS defined
// If the main layer has CRS defined, return them
function getLayerProjections(layer: CapabilityLayer): string[] {
    if (layer.CRS) {
        return layer.CRS
    }
    if ((layer.Layer ?? []).length > 0) {
        const allCRS = layer.Layer!.map((sublayer: CapabilityLayer) =>
            getLayerProjections(sublayer)
        )
        const commonCRS = allCRS.reduce((acc, crsArray) =>
            acc.filter((crs) => crsArray.includes(crs))
        )
        return commonCRS
    } else {
        return []
    }
}

/** Wrapper around the OpenLayer WMSCapabilities to add more functionalities */
export class externalWMSCapabilitiesParser {
    capabilities: WMSCapabilities

    constructor(content: string, originUrl: string) {
        const parser = new olWMSCapabilities()
        try {
            this.capabilities = parser.read(content)
        } catch (error) {
            log.error(`Failed to parse capabilities of ${originUrl}`, error)
            throw new CapabilitiesError(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `Failed to parse WMTS Capabilities: invalid content: ${error}`,
                'invalid_wms_capabilities'
            )
        }

        this.capabilities.originUrl = new URL(originUrl)
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
        if (Array.isArray(this.capabilities.Capability?.Request?.GetFeatureInfo?.DCPType)) {
            const httpElement = this.capabilities.Capability.Request.GetFeatureInfo?.DCPType[0].HTTP
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
                    this.capabilities.Capability.Request.GetFeatureInfo
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
            if (this.capabilities.Capability.Request.GetFeatureInfo.Format) {
                formats.push(...this.capabilities.Capability.Request.GetFeatureInfo.Format)
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
    findLayer(layerId: string) {
        if (!this.capabilities.Capability?.Layer) {
            return { layer: null, parents: null }
        }

        return findLayer(
            layerId,
            [this.capabilities.Capability.Layer],
            [this.capabilities.Capability.Layer]
        )
    }

    /**
     * Get ExternalWMSLayer object from capabilities for the given layer ID
     *
     * @param {string} layerId Layer ID of the layer to retrieve
     * @param {CoordinateSystem} projection Projection currently used by the application
     * @param {number} [opacity=1] Default is `1`
     * @param {boolean} [isVisible=true] Default is `true`
     * @param {Number | null} [currentYear=null] Current year to select for the time config. Only
     *   needed when a time config is present a year is pre-selected in the url parameter. Default
     *   is `null`
     * @param {Object | null} [params=null] URL parameters to pass to WMS server. Default is `null`
     * @param {boolean} [ignoreError=true] Don't throw exception in case of error, but return a
     *   default value or null. Default is `true`
     * @returns {ExternalWMSLayer | null} ExternalWMSLayer object or null in case of error
     */
    getExternalLayerObject(
        layerId: string,
        projection: CoordinateSystem,
        opacity = 1,
        isVisible = true,
        currentYear = null,
        params = null,
        ignoreError = true
    ) {
        const { layer, parents } = this.findLayer(layerId)

        if (!layer) {
            const msg = `No WMS layer ${layerId} found in Capabilities ${this.capabilities.originUrl.toString()}`
            log.error(msg, this)
            if (ignoreError) {
                return null
            }
            throw new CapabilitiesError(msg, 'no_layer_found')
        }
        return this._getExternalLayerObject(
            layer,
            parents ?? null,
            projection,
            opacity,
            isVisible,
            currentYear,
            params ?? undefined,
            ignoreError
        )
    }

    /**
     * Get all ExternalWMSLayer objects from capabilities
     *
     * @param {CoordinateSystem} projection Projection currently used by the application
     * @param {number} opacity
     * @param {boolean} isVisible
     * @param {Number | null} [currentYear=null] Current year to select for the time config. Only
     *   needed when a time config is present a year is pre-selected in the url parameter. Default
     *   is `null`
     * @param {Object | null} [params=null] URL parameters to pass to WMS server. Default is `null`
     * @param {boolean} ignoreError Don't throw exception in case of error, but return a default
     *   value or null
     * @returns {[ExternalWMSLayer]} List of ExternalWMSLayer objects
     */
    getAllExternalLayerObjects(
        projection: CoordinateSystem,
        opacity = 1,
        isVisible = true,
        currentYear: number | null = null,
        params = undefined,
        ignoreError = true
    ) {
        if (!this.capabilities.Capability?.Layer) {
            return null
        }

        return this.capabilities.Capability.Layer.Layer?.map((layer) =>
            this._getExternalLayerObject(
                layer,
                // we enforced that this is available
                [this.capabilities.Capability!.Layer!],
                projection,
                opacity,
                isVisible,
                currentYear,
                params,
                ignoreError
            )
        ).filter((layer) => !!layer)
    }

    _getExternalLayerObject(
        layer: CapabilityLayer,
        parents: CapabilityLayer[] | null,
        projection: CoordinateSystem,
        opacity: number,
        isVisible: boolean,
        currentYear: number | null,
        params?: Record<string, any>,
        ignoreError: boolean = true
    ): ExternalWMSLayer | null {
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
        } = this._getLayerAttributes(layer, parents!, projection, ignoreError)

        if (!layerId) {
            // without layerId we can do nothing
            return null
        }

        // Go through the child to get valid layers
        let layers: ExternalWMSLayer[] = []

        if (layer.Layer?.length) {
            layers = layer.Layer.map((l) =>
                this._getExternalLayerObject(
                    l,
                    [layer, ...parents!],
                    projection,
                    opacity,
                    isVisible,
                    currentYear,
                    params,
                    ignoreError
                )
            ).filter((layer) => !!layer)
        }
        return layerUtils.makeExternalWMSLayer({
            id: layerId,
            name: title,
            opacity,
            isVisible,
            baseUrl: url,
            layers,
            attributions,
            wmsVersion: version,
            format: 'png',
            abstract,
            extent: extent ?? undefined,
            legends,
            isLoading: false,
            availableProjections,
            hasTooltip: queryable,
            getFeatureInfoCapability: this.getFeatureInfoCapability(ignoreError),
            currentYear: currentYear ?? undefined,
            customAttributes: params,
            dimensions: dimensions,
            timeConfig: this._getTimeConfig(dimensions) ?? undefined,
        })
    }

    _getLayerAttributes(
        layer: CapabilityLayer,
        parents: CapabilityLayer[],
        projection: CoordinateSystem,
        ignoreError = true
    ) {
        let layerId = layer.Name
        // Some WMS only have a Title and no Name, therefore in this case take the Title as layerId
        if (!layerId && layer.Title) {
            // if we don't have a name use the title as name
            layerId = layer.Title
        }
        if (!layerId) {
            // Without layerID we cannot use the layer in our viewer
            const msg = `No layerId found in WMS capabilities for layer in ${this.capabilities.originUrl.toString()}`
            log.error(msg, layer)
            if (ignoreError) {
                return {}
            }
            throw new CapabilitiesError(msg, 'no_layer_found')
        }

        if (
            !this.capabilities.version ||
            !WMS_SUPPORTED_VERSIONS.includes(this.capabilities.version)
        ) {
            let msg = ''
            if (!this.capabilities.version) {
                msg = `No WMS version found in Capabilities of ${this.capabilities.originUrl.toString()}`
            } else {
                msg = `WMS version ${this.capabilities.version} of ${this.capabilities.originUrl.toString()} not supported`
            }
            log.error(msg, layer)
            if (ignoreError) {
                return {}
            }
            throw new CapabilitiesError(msg, 'no_wms_version_found')
        }

        let availableProjections = getLayerProjections(layer)
            .filter((crs) =>
                allCoordinateSystems.some((projection) => projection.epsg === crs.toUpperCase())
            )
            .map((crs) =>
                allCoordinateSystems.find((projection) => projection.epsg === crs.toUpperCase())
            ) as CoordinateSystem[] // let's assume that the filtering won't remove any for now

        // by default, WGS84 must be supported
        if (availableProjections.length === 0) {
            availableProjections = [WGS84]
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
                this.capabilities.Capability?.Request?.GetMap?.DCPType[0]?.HTTP?.Get
                    ?.OnlineResource || this.capabilities.originUrl.toString(),
            version: this.capabilities.version,
            abstract: layer.Abstract,
            attributions: this._getLayerAttribution(layerId, layer),
            extent: this._getLayerExtent(layerId, layer, parents, projection),
            legends: this._getLayerLegends(layerId, layer),
            queryable: layer.queryable,
            availableProjections,
            dimensions: this._getDimensions(layerId, layer),
        }
    }

    _getLayerExtent(
        layerId: string,
        layer: CapabilityLayer,
        parents: CapabilityLayer[],
        projection: CoordinateSystem
    ): LayerExtent | null {
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
                let extent = [...bbox.extent]

                // When transforming between WGS84 (EPSG:4326) and Web Mercator (EPSG:3857)
                // we have to be carefull because:
                // - WGS84 traditionally uses latitude-first (Y,X) axis order [minY, minX, maxY, maxX]
                // - Web Mercator uses longitude-first (X,Y) axis order [minX, minY, maxX, maxY]
                // Note: Some WGS84 implementations may use X,Y order,
                //       thats why we need to get the extent in the right order throught the function getExtentInOrderXY
                if (bbox.crs === WGS84.epsg && projection.epsg === WEBMERCATOR.epsg) {
                    extent = WGS84.getExtentInOrderXY(extent)
                }
                layerExtent = [
                    proj4(bbox.crs, projection.epsg, [extent[0], extent[1]]),
                    proj4(bbox.crs, projection.epsg, [extent[2], extent[3]]),
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
            const msg = `No layer extent found for ${layerId} in ${this.capabilities.originUrl.toString()}`
            log.error(msg, layer, parents)
        }

        return layerExtent
    }

    _getLayerAttribution(layerId: string, layer: CapabilityLayer) {
        let title = null
        let url = null

        try {
            if (layer.Attribution || this.capabilities.Capability?.Layer?.Attribution) {
                const attribution =
                    layer.Attribution || this.capabilities.Capability?.Layer?.Attribution
                url = attribution.OnlineResource
                title = attribution.Title || new URL(attribution.OnlineResource).hostname
            } else {
                title =
                    this.capabilities.Service?.Title ||
                    new URL(this.capabilities.Service?.OnlineResource).hostname
            }
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            const msg = `Failed to get an attribution title/url for ${layerId}: ${error}`
            log.error(msg, layer, error)
            title = new URL(this.capabilities.originUrl).hostname
            url = null
        }

        return [{ name: title, url } as LayerAttribution]
    }

    _getLayerLegends(layerId: string, layer: CapabilityLayer): LayerLegend[] {
        const styles = layer.Style?.filter((s) => s.LegendURL?.length > 0) ?? []

        // if we do not have access to the legend in pure WMS fashion, we check if this
        // WMS follows the SLD specification, and if we can get it from there.
        if (
            styles.length === 0 &&
            layer.queryable &&
            !!this.Capability.UserDefinedSymbolization?.SupportSLD
        ) {
            const getLegendGraphicBaseUrl =
                this.Capability.Request.GetLegendGraphic?.DCPType[0]?.HTTP?.Get?.OnlineResource
            const getLegendGraphicFormat = this.Capability.Request.GetLegendGraphic?.Format[0]
            if (!!getLegendGraphicBaseUrl && !!getLegendGraphicFormat) {
                const getLegendParams = new URLSearchParams({
                    SERVICE: 'WMS',
                    REQUEST: 'GetLegendGraphic',
                    VERSION: this.version,
                    FORMAT: getLegendGraphicFormat,
                    LAYER: layerId,
                    SLD_VERSION: '1.1.0',
                })
                return [
                    {
                        url: `${getLegendGraphicBaseUrl}${getLegendParams.toString()}`,
                        format: getLegendGraphicFormat,
                    },
                ]
            }
        }
        return styles
            .map((style) =>
                style.LegendURL.map((legend) => {
                    const width = legend.size?.length >= 2 ? legend.size[0] : null
                    const height = legend.size?.length >= 2 ? legend.size[1] : null
                    return {
                        url: legend.OnlineResource,
                        format: legend.Format,
                        width: width ?? 0,
                        height: height ?? 0,
                    }
                })
            )
            .flat()
    }

    _parseDimensionValues(layerId: string, rawValues: string) {
        const parseYear = (value: string) => {
            const date = new Date(value)
            if (!isNaN(date.getFullYear())) {
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
                        step = parseInt(periodMatch[1])
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

    _getDimensions(layerId: string, layer: CapabilityLayer): WMSDimension[] {
        return (
            layer.Dimension?.map((d: Record<string, any>) => ({
                id: d.name,
                dft: d.default,
                values: this._parseDimensionValues(layerId, d.values ?? ''),
                current: {
                    current: d.current ?? false,
                },
            })) ?? []
        )
    }

    _getTimeConfig(dimensions: any[] | undefined) {
        if (!dimensions) {
            return null
        }

        const timeDimension = dimensions.find((d) => {
            return d.id.toLowerCase() === 'time'
        })
        if (!timeDimension) {
            return null
        }
        const timeEntries =
            timeDimension.values?.map((value: any) => makeTimeConfigEntry(value)) ?? []
        return makeTimeConfig(timeDimension.default ?? null, timeEntries)
    }
}
