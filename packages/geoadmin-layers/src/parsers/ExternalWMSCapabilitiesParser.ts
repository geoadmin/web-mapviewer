// @ts-nocheck
import { allCoordinateSystems, CoordinateSystem, WEBMERCATOR, WGS84 } from '@geoadmin/coordinates'
import log, { LogPreDefinedColor } from '@geoadmin/log'
import { range } from 'lodash'
import { default as olWMSCapabilities } from 'ol/format/WMSCapabilities'
import proj4 from 'proj4'

import type { CapabilitiesParser, ExternalLayerParsingOptions } from '@/parsers/parser'
import type { LayerTimeConfig } from '@/types'

import {
    type BoundingBox,
    type ExternalLayerGetFeatureInfoCapability,
    type ExternalWMSLayer,
    type LayerAttribution,
    type LayerExtent,
    type LayerLegend,
    WMS_SUPPORTED_VERSIONS,
    type WMSDimension,
} from '@/types/layers'
import { layerUtils } from '@/utils'
import { makeTimeConfig, makeTimeConfigEntry } from '@/utils/timeConfigUtils'
import { CapabilitiesError } from '@/validation'

interface WMSBoundingBox {
    crs: string
    extent: [number, number, number, number]
    res: [number | null, number | null]
}

interface LegendURL {
    Format: string
    size: [number, number]
    OnlineResource: string
}

interface WMSCapabilityLayerStyle {
    LegendURL: LegendURL[]
    Identifier: string
    isDefault: boolean
}

export interface WMSCapabilityLayer {
    Dimension?: Record<string, any>
    Name: string
    parent: WMSCapabilityLayer
    Title: string
    Layer?: WMSCapabilityLayer[]
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
    Style: WMSCapabilityLayerStyle[]
}

interface DCPType {
    HTTP: {
        Get?: {
            OnlineResource: string
        }
        Post?: {
            OnlineResource: string
        }
    }
}

interface Request {
    DCPType: DCPType[]
    Format: string[]
}

/**
 * GetMap and GetCapabilities are mandatory according to WMS OGC specification, GetFeatureInfo is
 * optional
 */
export interface WMSRequestCapabilities {
    GetCapabilities: Request
    GetMap: Request
    GetFeatureInfo?: Request
}

interface WMSCapability {
    Layer?: WMSCapabilityLayer
    TileMatrixSet: Array<{
        BoundingBox: BoundingBox[]
        Identifier: string
        SupportedCRS?: string
        TileMatrix: Object[]
    }>
    Request: WMSRequestCapabilities
}

export interface WMSCapabilitiesResponse {
    originUrl: URL
    version: string
    Capability?: WMSCapability
    ServiceProvider?: {
        ProviderName?: string
        ProviderSite?: string
    }
    OperationsMetadata?: Record<string, any>
    Service: {
        Title: string
        OnlineResource: string
        MaxWidth?: number
        MaxHeight?: number
    }
}

type WMSLayerAndItsParents = {
    layer?: WMSCapabilityLayer
    parents?: WMSCapabilityLayer[]
}

function listAllCapabilitiesLayer(capabilities: WMSCapabilitiesResponse): WMSCapabilityLayer[] {
    return capabilities.Capability?.Layer?.Layer ?? []
}

/**
 * Find recursively in the WMS capabilities the matching layer ID node and its parents
 *
 * @returns Capability layer node and its parents or an empty object if not found
 */
function findLayer(
    capabilities: WMSCapabilitiesResponse,
    layerId: string,
    outputProjection?: CoordinateSystem = WGS84
): WMSLayerAndItsParents | undefined {
    if (!capabilities.Capability?.Layer) {
        return
    }

    return findLayerRecurse(
        layerId,
        [capabilities.Capability.Layer],
        [capabilities.Capability.Layer],
        outputProjection
    )
}

function findLayerRecurse(
    layerId: string,
    layers: WMSCapabilityLayer[],
    parents: WMSCapabilityLayer[],
    outputProjection?: CoordinateSystem = WGS84
): WMSLayerAndItsParents {
    let found: WMSLayerAndItsParents = {}

    for (let i = 0; i < layers?.length && !found.layer; i++) {
        if (layers[i]?.Name === layerId || layers[i]?.Title === layerId) {
            found.layer = layers[i]
            found.parents = parents
        } else if ((layers[i]?.Layer ?? []).length > 0) {
            found = findLayerRecurse(layerId, layers[i]?.Layer, [layers[i], ...parents])
        }
    }
    return found
}

/**
 * Returns the common projection identifiers of all sublayers, if the main layer doesn't have any
 * CRS defined.
 *
 * If the main layer has CRS defined, returns it
 */
function getLayerProjections(layer: WMSCapabilityLayer): string[] {
    if (layer.CRS) {
        return layer.CRS
    }
    if (layer.Layer?.length > 0) {
        const allCRS = new Set<string>(
            layer.Layer.map((sublayer: WMSCapabilityLayer) => getLayerProjections(sublayer))
        )
        return Array.from(allCRS)
    } else {
        return []
    }
}

function getLayerAttribution(
    capabilities: WMSCapabilitiesResponse,
    layerId: string,
    layer: WMSCapabilityLayer
): LayerAttribution[] {
    let title: string
    let url: string

    try {
        if (layer.Attribution || capabilities.Capability?.Layer?.Attribution) {
            const attribution = layer.Attribution || capabilities.Capability?.Layer?.Attribution
            url = attribution.OnlineResource
            title = attribution.Title || new URL(attribution.OnlineResource).hostname
        } else {
            title =
                capabilities.Service?.Title ||
                new URL(capabilities.Service?.OnlineResource).hostname
        }
    } catch (error) {
        const msg = `Failed to get an attribution title/url for ${layerId}: ${error?.toString()}`
        log.error(msg, layer, error)
        title = new URL(capabilities.originUrl).hostname
        url = null
    }

    return [{ name: title, url } as LayerAttribution]
}

function getLayerExtent(
    capabilities: WMSCapabilitiesResponse,
    layerId: string,
    layer: WMSCapabilityLayer,
    parents: WMSCapabilityLayer[],
    projection: CoordinateSystem
): LayerExtent | undefined {
    // TODO PB-243 handling of extent out of projection bound (currently not properly handled)
    // - extent totally out of projection bounds
    //    => return null and set outOfBounds flag to true
    // - extent totally inside of projection bounds
    //   => crop extent and set outOfBounds flag to true
    // - extent partially inside projection bounds
    //   => take intersect extent and set outOfBounds flag to true
    // - no extent
    //   => return null and set the outOfBounds flag to false (we don't know)
    let layerExtent: LayerExtent | undefined

    const matchedBbox: WMSBoundingBox | undefined = layer.BoundingBox?.find(
        (bbox) => bbox.crs === projection.epsg
    )

    // First try to find a matching extent from the BoundingBox
    if (matchedBbox) {
        layerExtent = [
            [matchedBbox.extent[0], matchedBbox.extent[1]],
            [matchedBbox.extent[2], matchedBbox.extent[3]],
        ]
    }
    // Then try to find a supported CRS extent from the BoundingBox
    if (!layerExtent) {
        const bbox: WMSBoundingBox | undefined = layer.BoundingBox?.find((bbox) =>
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
    // Finally, search the extent in the parents
    if (!layerExtent && parents.length > 0) {
        return getLayerExtent(capabilities, layerId, parents[0], parents.slice(1), projection)
    }

    if (!layerExtent) {
        const msg = `No layer extent found for ${layerId} in ${capabilities.originUrl.toString()}`
        log.error(msg, layer, parents)
    }

    return layerExtent
}

function getLayerLegends(
    capabilities: WMSCapabilitiesResponse,
    layerId: string,
    layer: WMSCapabilityLayer
): LayerLegend[] {
    const styles: WMSCapabilityLayerStyle[] =
        layer.Style?.filter((s) => s.LegendURL?.length > 0) ?? []

    // if we do not have access to the legend in pure WMS fashion, we check if this
    // WMS follows the SLD specification, and if we can get it from there.
    if (
        styles.length === 0 &&
        layer.queryable &&
        !!capabilities.Capability.UserDefinedSymbolization?.SupportSLD
    ) {
        const getLegendGraphicBaseUrl =
            capabilities.Capability.Request.GetLegendGraphic?.DCPType[0]?.HTTP?.Get?.OnlineResource
        const getLegendGraphicFormat = capabilities.Capability.Request.GetLegendGraphic?.Format[0]
        if (!!getLegendGraphicBaseUrl && !!getLegendGraphicFormat) {
            const getLegendParams = new URLSearchParams({
                SERVICE: 'WMS',
                REQUEST: 'GetLegendGraphic',
                VERSION: capabilities.version,
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

function parseDimensionYear(value: string): number | undefined {
    const date = new Date(value)
    if (!isNaN(date.getFullYear())) {
        return date.getFullYear()
    }
    return
}

function getDimensions(layerId: string, layer: WMSCapabilityLayer): WMSDimension[] {
    return layer.Dimension?.map((d: Record<string, any>) => {
        return {
            id: d.name,
            dft: d.default,
            values: d.values
                .split(',')
                .map((v) => {
                    if (v.includes('/')) {
                        const [min, max, res] = v.split('/')
                        const minYear = parseDimensionYear(min)
                        const maxYear = parseDimensionYear(max)
                        if (minYear === undefined || maxYear === undefined) {
                            log.warn(
                                `Unsupported dimension min/max value "${min}"/"${max}" for layer ${layerId}`
                            )
                            return
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
                .map((v) => `${v}`),
            current: {
                current: d.current ?? false,
            },
        }
    })
}

function getTimeConfig(dimensions?: any[]): LayerTimeConfig | undefined {
    if (!dimensions) {
        return
    }

    const timeDimension = dimensions.find((d) => {
        return d.id.toLowerCase() === 'time'
    })
    if (!timeDimension) {
        return
    }
    const timeEntries =
        timeDimension.values?.map((value: string) => makeTimeConfigEntry(value)) ?? []
    return makeTimeConfig(timeDimension.default, timeEntries)
}

function getLayerAttributes(
    capabilities: WMSCapabilitiesResponse,
    layer: WMSCapabilityLayer,
    parents: WMSCapabilityLayer[],
    projection: CoordinateSystem,
    ignoreError = true
): Partial<WMSCapabilityLayer> {
    let layerId = layer.Name
    // Some WMS only have a Title and no Name, in this case take the Title as layerId
    if ((!layerId || layerId.length === 0) && layer.Title) {
        layerId = layer.Title
    }
    if (!layerId || layerId.length === 0) {
        // Without layerID we cannot use the layer in our viewer
        const msg = `No layerId found in WMS capabilities for layer in ${capabilities.originUrl.toString()}`
        log.error(msg, layer)
        if (ignoreError) {
            return {}
        }
        throw new CapabilitiesError(msg, 'no_layer_found')
    }

    if (!capabilities.version || !WMS_SUPPORTED_VERSIONS.includes(capabilities.version)) {
        let msg = ''
        if (!capabilities.version) {
            msg = `No WMS version found in Capabilities of ${capabilities.originUrl.toString()}`
        } else {
            msg = `WMS version ${capabilities.version} of ${capabilities.originUrl.toString()} not supported`
        }
        log.error(msg, layer)
        if (ignoreError) {
            return {}
        }
        throw new CapabilitiesError(msg, 'no_wms_version_found')
    }

    let availableProjections: CoordinateSystem[] = getLayerProjections(layer)
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
    availableProjections = availableProjections.filter(
        (projection, index, self) => self.indexOf(projection) === index
    )
    if (availableProjections.length === 0) {
        const msg = `No projections found for layer ${layerId}`
        if (!ignoreError) {
            throw new CapabilitiesError(msg)
        } else {
            log.error(msg, layer)
        }
    }

    return {
        id: layerId,
        name: layer.Title,
        baseUrl:
            capabilities.Capability?.Request?.GetMap?.DCPType[0]?.HTTP?.Get?.OnlineResource ??
            capabilities.originUrl.toString(),
        version: capabilities.version,
        abstract: layer.Abstract,
        attributions: getLayerAttribution(capabilities, layerId, layer),
        extent: getLayerExtent(capabilities, layerId, layer, parents, projection),
        legends: getLayerLegends(capabilities, layerId, layer),
        hasTooltip: layer.queryable,
        availableProjections,
        dimensions: getDimensions(layerId, layer),
        timeConfig: this._getTimeConfig(dimensions),
    }
}
function getFeatureInfoCapability(
    capabilities: WMSCapabilitiesResponse,
    ignoreError = true
): ExternalLayerGetFeatureInfoCapability | undefined {
    if (Array.isArray(capabilities.Capability?.Request?.GetFeatureInfo?.DCPType)) {
        const getFeatureInfoCapability =
            capabilities.Capability.Request.GetFeatureInfo?.DCPType[0].HTTP
        let baseUrl: string
        let method = 'GET'
        if (getFeatureInfoCapability?.Get) {
            baseUrl = getFeatureInfoCapability.Get.OnlineResource
        } else if (getFeatureInfoCapability?.Post) {
            method = 'POST'
            baseUrl = getFeatureInfoCapability.Post.OnlineResource
        } else {
            log.error(
                "Couldn't parse GetFeatureInfo data",
                capabilities.Capability.Request.GetFeatureInfo
            )
            if (ignoreError) {
                return null
            }
            throw new CapabilitiesError('Invalid GetFeatureInfo data', 'invalid_get_feature_info')
        }
        const formats: string[] = []
        if (capabilities.Capability.Request.GetFeatureInfo.Format) {
            formats.push(...capabilities.Capability.Request.GetFeatureInfo.Format)
        }
        return {
            baseUrl,
            method,
            formats,
        }
    }
    return
}

/**
 * Get ExternalWMSLayer object from capabilities for the given layer ID
 *
 * @param capabilities
 * @param layerOrLayerId Layer ID of the layer to retrieve, or the layer object itself (from the
 *   capabilities)
 * @param options
 * @param options.outputProjection Projection currently used by the application
 * @param options.opacity
 * @param options.isVisible
 * @param options.currentYear Current year to select for the time config. Only needed when a time
 *   config is present, a year is pre-selected in the url parameter.
 * @param options.params URL parameters to pass to WMS server
 * @param options.ignoreError Don't throw exception in case of error, but return a default value or
 *   undefined
 * @returns Layer object, or undefined in case of error (and ignoreError is equal to true)
 */
function getLayerObject(
    capabilities: WMSCapabilitiesResponse,
    layerOrLayerId: WMSCapabilityLayer | string,
    options?: ExternalLayerParsingOptions<ExternalWMSLayer>
): ExternalWMSLayer | undefined {
    if (!layerOrLayerId) {
        // without a layer object or layer ID we can do nothing
        return
    }

    const {
        outputProjection = WGS84,
        opacity = 1,
        isVisible = true,
        currentYear,
        params,
        ignoreError = true,
    } = options

    let layerId: string
    if (typeof layerOrLayerId === 'string') {
        layerId = layerOrLayerId
    } else {
        layerId = layerOrLayerId.Name
    }

    const { layer, parents } = findLayer(capabilities, layerId, outputProjection)
    if (!layer) {
        const msg = `No WMS layer ${layerId} found in Capabilities ${capabilities.originUrl.toString()}`
        log.error({
            title: 'WMS Capabilities parser',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [msg, capabilities],
        })
        if (ignoreError) {
            return
        }
        throw new CapabilitiesError(msg, 'no_layer_found')
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
        ...getLayerAttributes(layer, parents, projection, ignoreError),
        format: 'png',
        isLoading: false,
        getFeatureInfoCapability: getFeatureInfoCapability(ignoreError),
        currentYear,
        customAttributes: params,
    })
}

function getAllLayerObjects(
    capabilities: WMSCapabilitiesResponse,
    outputProjection?: CoordinateSystem = WGS84,
    initialValues?: Partial<ExternalWMSLayer> = {}
): ExternalWMSLayer[] {
    return listAllCapabilitiesLayer(capabilities).map((layer) =>
        getLayerObject(capabilities, layer, outputProjection, initialValues)
    )
}

function parse(content: string, originUrl: URL): WMSCapabilitiesResponse {
    const parser = new olWMSCapabilities()
    try {
        return parser.read(content) as WMSCapabilitiesResponse
    } catch (error) {
        log.error({
            title: 'WMS Capabilities parser',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [`Failed to parse capabilities of ${originUrl}`, error],
        })
        throw new CapabilitiesError(
            `Failed to parse WMTS Capabilities: invalid content: ${error?.toString()}`,
            'invalid_wms_capabilities'
        )
    }
}

export const ExternalWMSCapabilitiesParser: CapabilitiesParser<
    WMSCapabilitiesResponse,
    WMSCapabilityLayer,
    ExternalWMSLayer
> = {
    parse,
    getAllCapabilitiesLayers: listAllCapabilitiesLayer,
    getCapabilitiesLayer: findLayer,
    getAllExternalLayers: getAllLayerObjects,
    getExternalLayer: getLayerObject,
}

export default ExternalWMSCapabilitiesParser
