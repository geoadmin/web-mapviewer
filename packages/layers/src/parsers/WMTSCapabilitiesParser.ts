import type { CoordinateSystem, FlatExtent } from '@swissgeo/coordinates'

import { allCoordinateSystems, extentUtils, WGS84 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { default as olWMTSCapabilities } from 'ol/format/WMTSCapabilities'
import { optionsFromCapabilities } from 'ol/source/WMTS'

import type {
    BoundingBox,
    CapabilitiesParser,
    ExternalLayerParsingOptions,
    ExternalLayerTimeDimension,
    ExternalWMTSLayer,
    LayerAttribution,
    LayerLegend,
    LayerTimeConfig,
    TileMatrixSet,
    WMTSCapabilitiesResponse,
    WMTSCapabilitiesTileMatrixSet,
    WMTSCapabilityLayer,
    WMTSCapabilityLayerDimension,
    WMTSCapabilityLayerStyle,
    WMTSLegendURL,
    WMTSOnlineResource,
    WMTSTileMatrixSetLink,
    WMTSEncodingType,
} from '@/types'
import type { TileMatrix } from '@/types/layers'

import layerUtils from '@/utils/layerUtils'
import timeConfigUtils from '@/utils/timeConfigUtils'
import { CapabilitiesError } from '@/validation'

function parseCrs(crs?: string): CoordinateSystem | undefined {
    let epsgNumber = crs?.split(':').pop()
    if (!epsgNumber) {
        return
    }

    if (/84/.test(epsgNumber)) {
        epsgNumber = '4326'
    }
    return allCoordinateSystems.find((system) => system.epsg === `EPSG:${epsgNumber}`)
}

function getLayerAttribution(
    capabilities: WMTSCapabilitiesResponse,
    layerId: string
): LayerAttribution[] {
    let title = capabilities.ServiceProvider?.ProviderName
    const url = capabilities.ServiceProvider?.ProviderSite

    if (!title) {
        log.warn({
            title: 'WMTS Capabilities parser',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [`No attribution title for layer ${layerId}`, capabilities],
        })
        title = capabilities.originUrl.hostname
    }
    return [{ name: title, url } as LayerAttribution]
}

function findTileMatrixSetFromLinks(
    capabilities: WMTSCapabilitiesResponse,
    links: WMTSTileMatrixSetLink[]
): WMTSCapabilitiesTileMatrixSet | undefined {
    for (const link of links) {
        const tileMatrixSet = capabilities.Contents?.TileMatrixSet?.find(
            (set) => set.Identifier === link.TileMatrixSet
        )
        if (tileMatrixSet) {
            return tileMatrixSet
        }
    }
    return
}

function getLayerExtent(
    capabilities: WMTSCapabilitiesResponse,
    layerId: string,
    layer: WMTSCapabilityLayer,
    projection: CoordinateSystem
): FlatExtent | undefined {
    // TODO PB-243 handling of extent out of projection bound (currently not properly handled)
    let layerExtent: FlatExtent | undefined
    let extentProjection: CoordinateSystem | undefined

    // First, try to get the extent from the default bounding box
    if (layer.WGS84BoundingBox?.length) {
        layerExtent = layer.WGS84BoundingBox
        extentProjection = WGS84
    } else if (layer.BoundingBox) {
        // Some providers don't use the WGS84BoundingBox but use the BoundingBox instead
        // search for a matching proj bounding box
        const matching = layer.BoundingBox.find((bbox) => parseCrs(bbox.crs ?? '') === projection)

        if (matching && matching.extent) {
            layerExtent = matching.extent
        } else if (layer.BoundingBox.length === 1 && !layer.BoundingBox[0]?.crs) {
            // if we have only one bounding box without CRS, then take it searching the CRS
            // fom the TileMatrixSet
            const tileMatrixSet = findTileMatrixSetFromLinks(capabilities, layer.TileMatrixSetLink)
            extentProjection = parseCrs(tileMatrixSet?.SupportedCRS)
            if (extentProjection) {
                if (layer.BoundingBox && layer.BoundingBox[0] && layer.BoundingBox[0].extent) {
                    layerExtent = layer.BoundingBox[0].extent
                }
            }
        } else {
            // if we have multiple bounding box search for the one that specifies a supported CRS
            const supported = layer.BoundingBox.find(
                (bbox: BoundingBox) => bbox.crs !== undefined && parseCrs(bbox.crs) !== undefined
            )

            if (supported && supported.crs && supported.extent) {
                extentProjection = parseCrs(supported.crs)
                layerExtent = supported.extent
            }
        }
    }

    // If we didn't find a valid and supported bounding box in the layer, then fallback to the
    // linked TileMatrixSet. NOTE: some providers don't specify the bounding box at the layer
    // level but on the TileMatrixSet
    if (!layerExtent && capabilities.Contents?.TileMatrixSet) {
        const tileMatrixSet = findTileMatrixSetFromLinks(capabilities, layer.TileMatrixSetLink)
        const system = parseCrs(tileMatrixSet?.SupportedCRS ?? '')

        if (
            tileMatrixSet &&
            system &&
            tileMatrixSet.BoundingBox &&
            tileMatrixSet.BoundingBox.length === 4
        ) {
            layerExtent = tileMatrixSet.BoundingBox as FlatExtent
            extentProjection = system
        }
    }

    // Convert the extent if needed
    if (layerExtent && extentProjection && projection.epsg !== extentProjection.epsg) {
        layerExtent = extentUtils.projExtent(extentProjection, projection, layerExtent)
    }
    if (!layerExtent) {
        const msg = `No layer extent found for ${layerId}`
        log.error(msg, layer)
    }

    return layerExtent
}

function getLegends(layer: WMTSCapabilityLayer): LayerLegend[] {
    const styles: WMTSCapabilityLayerStyle[] =
        layer.Style?.filter((s) => s.LegendURL?.length > 0) ?? []
    return styles
        .map((style) =>
            style.LegendURL.map(
                (legend: WMTSLegendURL): LayerLegend => ({
                    url: legend.href,
                    format: legend.format,
                    width: legend.width,
                    height: legend.height,
                })
            )
        )
        .flat()
}

function getAvailableProjections(
    capabilities: WMTSCapabilitiesResponse,
    layerId: string,
    layer: WMTSCapabilityLayer,
    ignoreError: boolean
): CoordinateSystem[] {
    const availableProjections: CoordinateSystem[] = []

    if (layer.WGS84BoundingBox?.length) {
        availableProjections.push(WGS84)
    }

    // Take the projections defined in BoundingBox
    availableProjections.push(
        ...(layer.BoundingBox?.map((bbox) => parseCrs(bbox.crs ?? '')).filter(
            (projection) => !!projection
        ) ?? [])
    )

    // Take the available projections from the tile matrix set
    const tileMatrixSetCrs = findTileMatrixSetFromLinks(
        capabilities,
        layer.TileMatrixSetLink
    )?.SupportedCRS

    if (tileMatrixSetCrs) {
        const tileMatrixSetProjection = parseCrs(tileMatrixSetCrs)
        if (!tileMatrixSetProjection) {
            log.warn({
                title: 'WMTS Capabilities parser',
                titleColor: LogPreDefinedColor.Indigo,
                messages: [`CRS ${tileMatrixSetCrs} no supported by application or invalid`],
            })
        } else {
            availableProjections.push(tileMatrixSetProjection)
        }
    }

    // Remove duplicates
    const uniqueAvailableProjections = [...new Set(availableProjections)]

    if (uniqueAvailableProjections.length === 0) {
        const msg = `No projections found for layer ${layerId}`
        if (!ignoreError) {
            throw new CapabilitiesError(msg)
        }
        log.error({
            title: 'WMTS Capabilities parser',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [msg, layer],
        })
    }
    return uniqueAvailableProjections
}

function getTileMatrixSets(
    capabilities: WMTSCapabilitiesResponse,
    layerId: string,
    layer: WMTSCapabilityLayer
): TileMatrixSet[] | undefined {
    // Based on the spec at least one TileMatrixSetLink should be available
    const ids = layer.TileMatrixSetLink.map((link) => link.TileMatrixSet)

    if (!capabilities.Contents?.TileMatrixSet) {
        return
    }

    return capabilities.Contents?.TileMatrixSet.filter((set) => ids.includes(set.Identifier))
        .map((set) => {
            const projection = parseCrs(set.SupportedCRS)
            if (!projection) {
                log.warn({
                    title: 'WMTS Capabilities parser',
                    titleColor: LogPreDefinedColor.Indigo,
                    messages: [
                        `Invalid or non supported CRS ${set.SupportedCRS} in TileMatrixSet ${set.Identifier} for layer ${layerId}}`,
                    ],
                })
                return
            }
            const tileMatrix: TileMatrix[] = []
            for (const matrix of set.TileMatrix) {
                tileMatrix.push({
                    id: matrix.Identifier,
                    scaleDenominator: matrix.ScaleDenominator,
                    topLeftCorner: matrix.TopLeftCorner,
                    tileWidth: matrix.TileWidth,
                    tileHeight: matrix.TileHeight,
                    matrixWidth: matrix.MatrixWidth,
                    matrixHeight: matrix.MatrixHeight,
                })
            }
            return {
                id: set.Identifier,
                projection: projection,
                tileMatrix,
            }
        })
        .filter((set) => !!set)
}

function getDimensions(layer: WMTSCapabilityLayer): ExternalLayerTimeDimension[] | undefined {
    if (!layer.Dimension || layer.Dimension.length === 0) {
        return
    }
    const identifiers = layer.Dimension.map((dimension) => dimension.Identifier)
    const dimensions: ExternalLayerTimeDimension[] = []
    for (const identifier of identifiers) {
        const entriesForIdentifier: WMTSCapabilityLayerDimension[] = layer.Dimension.filter(
            (d) => d.Identifier === identifier
        )
        dimensions.push({
            id: identifier,
            values: entriesForIdentifier.flatMap((d) => d.Value),
            defaultValue: entriesForIdentifier[0].Default,
        })
    }
    return dimensions
}

function getLayerAttributes(
    capabilities: WMTSCapabilitiesResponse,
    layer: WMTSCapabilityLayer,
    projection: CoordinateSystem,
    ignoreError = true
): Partial<ExternalWMTSLayer> {
    let layerId = layer.Identifier

    if (!layerId || layerId.length === 0) {
        // fallback to Title
        layerId = layer.Title
    }

    if (!layerId || layerId.length === 0) {
        const msg = `No layer identifier found in Capabilities ${capabilities.originUrl.toString()}`
        log.error({
            title: 'WMTS Capabilities parser',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [msg, layer],
        })
        if (ignoreError) {
            return {}
        }
        throw new CapabilitiesError(msg, { key: 'invalid_wmts_capabilities' })
    }

    let getCapUrl: string | undefined

    if (
        capabilities.OperationsMetadata &&
        'GetCapabilities' in capabilities.OperationsMetadata &&
        capabilities.OperationsMetadata.GetCapabilities !== undefined
    ) {
        const httpOperations = capabilities.OperationsMetadata.GetCapabilities.DCP.HTTP
        if (httpOperations.Get && httpOperations.Get.length > 0) {
            getCapUrl = httpOperations.Get[0].href
        } else if (httpOperations.Post && httpOperations.Post.length > 0) {
            getCapUrl = httpOperations.Post[0].href
        }
    }
    if (!getCapUrl) {
        getCapUrl = capabilities.originUrl.toString()
    }

    let getTileEncoding: WMTSEncodingType = 'REST'
    if (
        capabilities.OperationsMetadata &&
        'GetTile' in capabilities.OperationsMetadata &&
        capabilities.OperationsMetadata.GetTile !== undefined
    ) {
        const httpOperations = capabilities.OperationsMetadata.GetTile.DCP.HTTP
        let onlineResource: WMTSOnlineResource | undefined
        if (httpOperations.Get && httpOperations.Get.length > 0) {
            onlineResource = httpOperations.Get[0]!
        } else if (httpOperations.Post && httpOperations.Post.length > 0) {
            onlineResource = httpOperations.Post[0]!
        }
        if (onlineResource?.Constraint && onlineResource?.Constraint?.length > 0) {
            getTileEncoding = onlineResource.Constraint[0].AllowedValues
                .Value[0] as WMTSEncodingType
        }
    }

    return {
        id: layerId,
        name: layer.Title ?? layerId,
        baseUrl: getCapUrl,
        abstract: layer.Abstract,
        options: {
            version: capabilities.version,
        },
        attributions: getLayerAttribution(capabilities, layerId),
        extent: getLayerExtent(capabilities, layerId, layer, projection),
        legends: getLegends(layer),
        availableProjections: getAvailableProjections(capabilities, layerId, layer, ignoreError),
        getTileEncoding,
        urlTemplate: layer.ResourceURL[0]?.template ?? '',
        // Based on the spec, at least one style should be available
        style: layer.Style[0]?.Identifier,
        tileMatrixSets: getTileMatrixSets(capabilities, layerId, layer),
        dimensions: getDimensions(layer),
    }
}

function getCapabilitiesLayer(
    capabilities: WMTSCapabilitiesResponse,
    layerId: string
): WMTSCapabilityLayer | undefined {
    if (!capabilities.Contents?.Layer) {
        return
    }

    const layers = capabilities.Contents.Layer

    return layers.find((layer) => {
        return layer.Identifier === layerId || (!layer.Identifier && layer.Title === layerId)
    })
}

function getAllCapabilitiesLayers(capabilities: WMTSCapabilitiesResponse): WMTSCapabilityLayer[] {
    return capabilities.Contents?.Layer ?? []
}

function getTimeConfig(
    dimensions: ExternalLayerTimeDimension[] | undefined
): LayerTimeConfig | undefined {
    if (!dimensions) {
        return
    }

    const timeDimension = dimensions.find((d) => d.id.toLowerCase() === 'time')
    if (!timeDimension) {
        return
    }

    const timeEntries = timeDimension.values?.map((value) =>
        timeConfigUtils.makeTimeConfigEntry(value)
    )
    return timeConfigUtils.makeTimeConfig(timeDimension.defaultValue, timeEntries)
}

function getExternalLayer(
    capabilities: WMTSCapabilitiesResponse,
    layerOrLayerId: WMTSCapabilityLayer | string,
    options?: ExternalLayerParsingOptions<ExternalWMTSLayer>
): ExternalWMTSLayer | undefined {
    if (!layerOrLayerId) {
        // without a layer object or layer ID we can do nothing
        return
    }

    const { outputProjection = WGS84, initialValues = {}, ignoreErrors = true } = options ?? {}
    const { opacity = 1, isVisible = true, currentYear } = initialValues

    let layerId: string
    if (typeof layerOrLayerId === 'string') {
        layerId = layerOrLayerId
    } else {
        layerId = layerOrLayerId.Identifier
    }

    const layer = getCapabilitiesLayer(capabilities, layerId)
    if (!layer) {
        const msg = `No WMTS layer ${layerId} found in Capabilities ${capabilities.originUrl.toString()}`
        log.error({
            title: 'WMTS Capabilities parser',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [msg, capabilities],
        })
        if (ignoreErrors) {
            return
        }
        throw new CapabilitiesError(msg, { key: 'no_layer_found' })
    }
    const attributes = getLayerAttributes(capabilities, layer, outputProjection, ignoreErrors)

    if (!attributes || !attributes.id) {
        log.error(`No attributes found for layer ${layer.Identifier}`)
        return
    }

    let olOptions
    try {
        olOptions =
            optionsFromCapabilities(capabilities, {
                layer: attributes.id,
                projection: outputProjection.epsg,
            }) ?? undefined
    } catch (error) {
        log.warn({
            title: 'WMTS Capabilities parser',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [`Failed to get OpenLayers options for layer ${attributes.id}`, error],
        })
        if (!ignoreErrors) {
            throw new CapabilitiesError('Failed to parse WMTS layer options', {
                key: 'invalid_wmts_layer',
                cause: error,
            })
        }
        olOptions = undefined
    }

    return layerUtils.makeExternalWMTSLayer({
        type: 'WMTS',
        ...attributes,
        opacity,
        isVisible,
        isLoading: false,
        options: olOptions,
        timeConfig: getTimeConfig(attributes.dimensions),
        currentYear,
    })
}

function getAllExternalLayers(
    capabilities: WMTSCapabilitiesResponse,
    options?: ExternalLayerParsingOptions<ExternalWMTSLayer>
): ExternalWMTSLayer[] {
    return getAllCapabilitiesLayers(capabilities)
        .map((layer) => getExternalLayer(capabilities, layer, options))
        .filter((layer) => !!layer)
}

function parse(content: string, originUrl: URL): WMTSCapabilitiesResponse {
    const parser = new olWMTSCapabilities()
    try {
        const capabilities = parser.read(content) as WMTSCapabilitiesResponse
        if (!capabilities.version) {
            throw new CapabilitiesError(
                `No version found in Capabilities ${originUrl.toString()}`,
                { key: 'invalid_wmts_capabilities' }
            )
        }
        capabilities.originUrl = originUrl
        return capabilities
    } catch (error) {
        log.error({
            title: 'WMTS Capabilities parser',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [`Failed to parse capabilities of ${originUrl?.toString()}`, error],
        })
        throw new CapabilitiesError('Failed to parse WMTS Capabilities: invalid content', {
            key: 'invalid_wmts_capabilities',
            cause: error,
        })
    }
}

export type WMTSCapabilitiesParser = CapabilitiesParser<
    WMTSCapabilitiesResponse,
    WMTSCapabilityLayer,
    ExternalWMTSLayer
>

export const wmtsCapabilitiesParser: WMTSCapabilitiesParser = {
    parse,
    getAllCapabilitiesLayers,
    getCapabilitiesLayer,
    getAllExternalLayers,
    getExternalLayer,
}

export default wmtsCapabilitiesParser
