import { allCoordinateSystems, CoordinateSystem, WGS84 } from '@geoadmin/coordinates'
import log from '@geoadmin/log'
import { default as olWMTSCapabilities } from 'ol/format/WMTSCapabilities'
import { optionsFromCapabilities } from 'ol/source/WMTS'
import proj4 from 'proj4'

import {
    type BoundingBox,
    type ExternalWMTSLayer,
    type LayerAttribution,
    type LayerExtent,
    type LayerLegend,
    LayerType,
    type TileMatrixSet,
    type WMTSDimension,
    WMTSEncodingType,
} from '@/types'
import { type LayerTimeConfig } from '@/types/timeConfig'
import { layerUtils } from '@/utils'
import { makeTimeConfig, makeTimeConfigEntry } from '@/utils/timeConfigUtils'
import { CapabilitiesError } from '@/validation'

interface WMTSBoundingBox {
    lowerCorner?: [number, number]
    upperCorner?: [number, number]
    extent?: [number, number, number, number]
    crs?: string
    dimensions?: number
}

interface LegendURL {
    format: string
    width: number
    height: number
    href: string
}

interface CapabilityLayer {
    Dimension?: Record<string, any>
    ResourceURL: any
    Identifier: string
    Title: string
    WGS84BoundingBox?: { crs: string; dimensions: any }[]
    BoundingBox?: WMTSBoundingBox[]
    TileMatrixSetLink: TileMatrixSetLink[]
    Style: {
        LegendURL: LegendURL[]
        Identifier: string
        isDefault: boolean
    }[]
    Abstract: string
}

interface TileMatrixSetLink {
    TileMatrixSet: string
    TileMatrixSetLimits: Array<{
        MaxTileCol: number
        MaxTileRow: number
        MinTileCol: number
        MinTileRow: number
        TileMatrix: string
    }>
}

export interface WMTSCapabilities {
    originUrl: URL
    version: string
    Contents?: {
        Layer?: Array<CapabilityLayer>
        TileMatrixSet: Array<{
            BoundingBox: BoundingBox[]
            Identifier: string
            SupportedCRS?: string
            TileMatrix: Object[]
        }>
    }
    ServiceProvider?: {
        ProviderName?: string
        ProviderSite?: string
    }
    OperationsMetadata?: Record<string, any>
    ServiceIdentification: Record<string, any>
}

function parseCrs(crs: string) {
    let epsgNumber = crs?.split(':').pop()
    if (!epsgNumber) {
        return null
    }

    if (/84/.test(epsgNumber)) {
        epsgNumber = '4326'
    }
    return allCoordinateSystems.find((system) => system.epsg === `EPSG:${epsgNumber}`)
}

function findLayer(layerId: string, layers: CapabilityLayer[]): CapabilityLayer | null {
    let layer = null

    for (let i = 0; i < layers.length && !layer; i++) {
        if (layers[i].Identifier === layerId) {
            layer = layers[i]
        } else if (!layers[i].Identifier && layers[i].Title === layerId) {
            layer = layers[i]
        }
    }

    return layer
}

/** Wrapper around the OpenLayer WMSCapabilities to add more functionalities */
export class ExternalWMTSCapabilitiesParser {
    // a stubbed type of what the parser will return
    capabilities: WMTSCapabilities

    constructor(content: string, originUrl: URL) {
        const parser = new olWMTSCapabilities()
        const capabilities = parser.read(content)

        if (!capabilities.version) {
            throw new CapabilitiesError(
                `Failed to parse WMTS Capabilities: invalid content`,
                'invalid_wmts_capabilities'
            )
        }
        this.capabilities = capabilities
        this.capabilities.originUrl = originUrl
    }

    /**
     * Find recursively in the capabilities the matching layer ID node
     *
     * @param {string} layerId Layer ID to search for
     * @returns {WMTSCapabilities.Contents.Layer} Capability layer node
     */
    findLayer(layerId: string) {
        if (!this.capabilities.Contents?.Layer) {
            return null
        }

        return findLayer(layerId, this.capabilities.Contents?.Layer)
    }

    /**
     * Get ExternalWMTSLayer object from the capabilities for the given layer ID
     *
     * @param {string} layerId WMTS Capabilities layer ID to retrieve
     * @param {CoordinateSystem} projection Projection currently used by the application
     * @param {number} [opacity=1] Default is `1`
     * @param {boolean} [isVisible=true] Default is `true`
     * @param {Number | null} [currentYear=null] Current year to select for the time config. Only
     *   needed when a time config is present a year is pre-selected in the url parameter. Default
     *   is `null`
     * @param {boolean} [ignoreError=true] Don't throw exception in case of error, but return a
     *   default value or null. Default is `true`
     * @returns {ExternalWMTSLayer | null} ExternalWMTSLayer object
     */
    getExternalLayerObject(
        layerId: string,
        projection: CoordinateSystem,
        opacity = 1,
        isVisible = true,
        currentYear?: number,
        ignoreError = true
    ): ExternalWMTSLayer | undefined {
        const layer = this.findLayer(layerId)

        if (!layer) {
            const msg = `No WMTS layer ${layerId} found in Capabilities ${this.capabilities.originUrl.toString()}`
            log.error(msg)
            if (!ignoreError) {
                throw new CapabilitiesError(msg, 'no_layer_found')
            }
            return
        }

        return this._getExternalLayerObject(
            layer,
            projection,
            opacity,
            isVisible,
            currentYear,
            ignoreError
        )
    }

    /**
     * Get all ExternalWMTSLayer objects from capabilities
     *
     * @param projection Projection currently used by the application
     * @param opacity
     * @param isVisible
     * @param currentYear Current year to select for the time config. Only needed when a time config
     *   is present and a year is pre-selected in the url parameter.
     * @param ignoreError Don't throw exception in case of error, but return a default value or
     *   undefined
     * @returns List of ExternalWMTSLayer objects
     */
    getAllExternalLayerObjects(
        projection: CoordinateSystem,
        opacity = 1,
        isVisible = true,
        currentYear?: number,
        ignoreError: boolean = true
    ): ExternalWMTSLayer[] {
        if (!this.capabilities.Contents?.Layer) {
            return []
        }

        return this.capabilities.Contents.Layer.map((layer) =>
            this._getExternalLayerObject(
                layer,
                projection,
                opacity,
                isVisible,
                currentYear,
                ignoreError
            )
        ).filter((layer) => !!layer)
    }

    _getExternalLayerObject(
        layer: CapabilityLayer,
        projection: CoordinateSystem,
        opacity: number,
        isVisible: boolean,
        currentYear?: number,
        ignoreError: boolean = true
    ): ExternalWMTSLayer | undefined {
        const attributes = this._getLayerAttributes(layer, projection, ignoreError)

        if (!attributes) {
            log.error(`No attributes found for layer ${layer.Identifier}`)
            return
        }

        const projectionLike = projection.epsg

        const options = optionsFromCapabilities(this.capabilities, {
            layer: attributes.layerId,
            projection: projectionLike,
        })

        return layerUtils.makeExternalWMTSLayer({
            type: LayerType.WMTS,
            id: attributes.layerId!,
            name: attributes.title!,
            opacity,
            isVisible,
            baseUrl: attributes.url,
            attributions: attributes.attributions ?? [],
            abstract: attributes.abstract,
            extent: attributes.extent,
            legends: attributes.legends,
            isLoading: false,
            availableProjections: attributes.availableProjections,
            options: options ?? undefined,
            getTileEncoding: attributes.getTileEncoding,
            urlTemplate: attributes.urlTemplate,
            tileMatrixSets: attributes.tileMatrixSets,
            dimensions: attributes.dimensions,
            timeConfig: this._getTimeConfig(attributes.dimensions),
            currentYear,
        })
    }

    _getLayerAttributes(layer: CapabilityLayer, projection: CoordinateSystem, ignoreError = true) {
        let layerId = layer.Identifier

        if (!layerId) {
            // fallback to Title
            layerId = layer.Title
        }

        if (!layerId) {
            const msg = `No layer identifier found in Capabilities ${this.capabilities.originUrl.toString()}`
            log.error(msg, layer)
            if (ignoreError) {
                return {}
            }
            throw new CapabilitiesError(msg, 'invalid_wmts_capabilities')
        }

        const title = layer.Title ?? layerId

        const getCapUrl =
            this.capabilities.OperationsMetadata?.GetCapabilities?.DCP?.HTTP?.Get[0]?.href ??
            this.capabilities.originUrl.toString()

        return {
            layerId,
            title: title,
            url: getCapUrl,
            version: this.capabilities.version,
            abstract: layer.Abstract,
            attributions: this._getLayerAttribution(layerId),
            extent: this._getLayerExtent(layerId, layer, projection),
            legends: this._getLegends(layerId, layer),
            availableProjections: this._getAvailableProjections(layerId, layer, ignoreError),
            getTileEncoding: this._getTileEncoding(),
            urlTemplate: this._getUrlTemplate(layerId, layer),
            style: this._getStyle(layer),
            tileMatrixSets: this._getTileMatrixSets(layerId, layer),
            dimensions: this._getDimensions(layer),
        }
    }

    _findTileMatrixSetFromLinks(links: TileMatrixSetLink[]) {
        for (const link of links) {
            const tileMatrixSet = this.capabilities.Contents?.TileMatrixSet?.find(
                (set) => set.Identifier === link.TileMatrixSet
            )
            if (tileMatrixSet) {
                return tileMatrixSet
            }
        }
        return null
    }

    _getAvailableProjections(layerId: string, layer: CapabilityLayer, ignoreError: boolean) {
        let availableProjections = []

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
        const tileMatrixSetCrs = this._findTileMatrixSetFromLinks(
            layer.TileMatrixSetLink
        )?.SupportedCRS

        if (tileMatrixSetCrs) {
            const tileMatrixSetProjection = parseCrs(tileMatrixSetCrs)
            if (!tileMatrixSetProjection) {
                log.warn(`CRS ${tileMatrixSetCrs} no supported by application or invalid`)
            } else {
                availableProjections.push(tileMatrixSetProjection)
            }
        }

        // Remove duplicates
        availableProjections = [...new Set(availableProjections)]

        if (availableProjections.length === 0) {
            const msg = `No projections found for layer ${layerId}`
            if (!ignoreError) {
                throw new CapabilitiesError(msg)
            }
            log.error(msg, layer)
        }
        return availableProjections
    }

    _getLayerExtent(
        layerId: string,
        layer: CapabilityLayer,
        projection: CoordinateSystem
    ): LayerExtent | undefined {
        // TODO PB-243 handling of extent out of projection bound (currently not properly handled)

        let layerExtent
        let extentEpsg

        // First try to get the extent from the default bounding box
        if (layer.WGS84BoundingBox?.length) {
            layerExtent = [
                [layer.WGS84BoundingBox[0], layer.WGS84BoundingBox[1]],
                [layer.WGS84BoundingBox[2], layer.WGS84BoundingBox[3]],
            ]
            extentEpsg = WGS84.epsg
        }
        // Some provider don't uses the WGS84BoundingBox, but uses the BoundingBox instead
        else if (layer.BoundingBox) {
            // search for a matching proj bounding box
            const matching = layer.BoundingBox.find(
                (bbox) => parseCrs(bbox.crs ?? '') === projection
            )

            if (matching && matching.extent) {
                layerExtent = [
                    [matching.extent[0], matching.extent[1]],
                    [matching.extent[2], matching.extent[3]],
                ]
            } else if (layer.BoundingBox.length === 1 && !layer.BoundingBox[0].crs) {
                // if we have only one bounding box without CRS, then take it searching the CRS
                // fom the TileMatrixSet
                const tileMatrixSet = this._findTileMatrixSetFromLinks(layer.TileMatrixSetLink)
                extentEpsg = parseCrs(tileMatrixSet?.SupportedCRS ?? '')?.epsg
                if (extentEpsg) {
                    if (layer.BoundingBox && layer.BoundingBox[0] && layer.BoundingBox[0].extent) {
                        layerExtent = [
                            [layer.BoundingBox[0].extent[0], layer.BoundingBox[0].extent[1]],
                            [layer.BoundingBox[0].extent[2], layer.BoundingBox[0].extent[3]],
                        ]
                    }
                }
            } else {
                // if we have multiple bounding box search for the one that specify a supported CRS
                const supported = layer.BoundingBox.find((bbox: BoundingBox) =>
                    bbox.crs ? parseCrs(bbox.crs) : false
                )

                if (supported && supported.crs !== null && supported.extent) {
                    extentEpsg = parseCrs(supported.crs ?? '')?.epsg
                    layerExtent = [
                        [supported.extent[0], supported.extent[1]],
                        [supported.extent[2], supported.extent[3]],
                    ]
                }
            }
        }

        // If we didn't find a valid and supported bounding box in the layer then fallback to the
        // linked TileMatrixSet. NOTE: some provider don't specify the bounding box at the layer
        // level but on the TileMatrixSet
        if (!layerExtent && this.capabilities.Contents?.TileMatrixSet) {
            const tileMatrixSet = this._findTileMatrixSetFromLinks(layer.TileMatrixSetLink)
            const system = parseCrs(tileMatrixSet?.SupportedCRS ?? '')

            if (tileMatrixSet && system && tileMatrixSet.BoundingBox) {
                layerExtent = [
                    [tileMatrixSet.BoundingBox[0], tileMatrixSet.BoundingBox[1]],
                    [tileMatrixSet.BoundingBox[2], tileMatrixSet.BoundingBox[3]],
                ]
                extentEpsg = system.epsg
            }
        }

        // Convert the extent if needed
        if (
            layerExtent &&
            extentEpsg &&
            projection.epsg !== extentEpsg &&
            Array.isArray(layerExtent)
        ) {
            layerExtent = [
                //  we asserted it's an array above
                proj4(extentEpsg, projection.epsg, layerExtent[0] as Array<number>),
                proj4(extentEpsg, projection.epsg, layerExtent[1] as Array<number>),
            ]
        }
        if (!layerExtent) {
            const msg = `No layer extent found for ${layerId}`
            log.error(msg, layer)
        }

        return layerExtent
    }

    _getLayerAttribution(layerId: string) {
        let title = this.capabilities.ServiceProvider?.ProviderName
        const url = this.capabilities.ServiceProvider?.ProviderSite

        if (!title) {
            const msg = `No attribution title for layer ${layerId}`
            log.error(msg)
            title = this.capabilities.originUrl.hostname
        }
        return [{ name: title, url } as LayerAttribution]
    }

    _getLegends(layerId: string, layer: CapabilityLayer) {
        const styles = layer.Style?.filter((s) => s.LegendURL?.length > 0) ?? []
        return styles
            .map((style) =>
                style.LegendURL.map(
                    (legend: LegendURL) =>
                        ({ url: legend.href, format: legend.format }) as LayerLegend
                )
            )
            .flat()
    }

    _getTileEncoding() {
        return (
            this.capabilities.OperationsMetadata?.GetTile?.DCP?.HTTP?.Get[0]?.Constraint[0]
                ?.AllowedValues?.Value[0] ?? WMTSEncodingType.REST
        )
    }

    _getUrlTemplate(layerId: string, layer: CapabilityLayer) {
        return layer.ResourceURL[0]?.template ?? ''
    }

    _getStyle(layer: CapabilityLayer) {
        // Based on the spec at least one style should be available
        return layer.Style[0].Identifier
    }

    _getTileMatrixSets(layerId: string, layer: CapabilityLayer): TileMatrixSet[] | undefined {
        // Based on the spec at least one TileMatrixSetLink should be available
        const ids = layer.TileMatrixSetLink.map((link) => link.TileMatrixSet)

        if (!this.capabilities.Contents?.TileMatrixSet) {
            return
        }

        return this.capabilities.Contents?.TileMatrixSet.filter((set) =>
            ids.includes(set.Identifier)
        )
            .map((set) => {
                const projection = parseCrs(set.SupportedCRS ?? '')
                if (!projection) {
                    log.warn(
                        `Invalid or non supported CRS ${set.SupportedCRS} in TileMatrixSet ${set.Identifier} for layer ${layerId}}`
                    )
                    return null
                }
                return {
                    id: set.Identifier,
                    projection: projection,
                    tileMatrix: set.TileMatrix,
                }
            })
            .filter((set) => !!set)
    }

    _getDimensions(layer: CapabilityLayer): WMTSDimension[] {
        return layer.Dimension?.map((d: { Identifier: any; Default: any; Value: any }) => ({
            id: d.Identifier,
            default: d.Default,
            values: d.Value,
        }))
    }

    _getTimeConfig(dimensions: any[] | undefined): LayerTimeConfig | undefined {
        if (!dimensions) {
            return
        }

        const timeDimension = dimensions.find((d) => d.id.toLowerCase() === 'time')
        if (!timeDimension) {
            return
        }

        const timeEntries = timeDimension.values?.map((value: any) => makeTimeConfigEntry(value))
        return makeTimeConfig(timeDimension.default, timeEntries)
    }
}
