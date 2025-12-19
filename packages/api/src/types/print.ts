import type { CoordinateSystem, FlatExtent } from '@swissgeo/coordinates'
import type { Layer } from '@swissgeo/layers'

/**
 * Bunch of key/values to be passed to the service-print3 backend, when printing the layout these
 * params come attached with.
 */
export interface PrintCapabilitiesClientParams {
    [key: string]: unknown
}

/** Information to show the "client" (aka the user) when selecting a layout */
export interface PrintCapabilitiesClientInfo {
    dpiSuggestions: number[]
    scales: number[]
    maxDPI: number
    width: number
    height: number
}

export interface PrintCapabilitiesLayerAttribute {
    name: string
    type: string
    default?: string
    clientParams?: Record<string, unknown>
    clientInfo?: {
        dpiSuggestions: number[]
        scales: number[]
        maxDPI: number
        width: number
        height: number
    }
}

export interface PrintCapabilitiesLayer {
    name: string
    attributes: PrintCapabilitiesLayerAttribute[]
}

export interface PrintCapabilitiesResponse {
    app: string
    layouts: PrintCapabilitiesLayer[]
    smtp: {
        enabled: boolean
    }
    formats: string[]
}

/**
 * One parameter (out of many), required to start a print job.
 *
 * This is where information about print capabilities for a specific layout will be stored (inside
 * the clientInfo object), e.g. which scales can be used on the map, available DPIs, etc...
 */
export interface PrintLayoutAttribute {
    /** Name to give this attribute when sending it to the backend. */
    readonly name: string
    /**
     * Type identifier of this attribute. Can range from "String" to "URL" and "double" (see
     * https://map.geo.admin.ch/api/print3/print/mapviewer/capabilities.json for all possible
     * values)
     */
    readonly type: string
    /**
     * Default value to give to the backend if the user hasn't (or wasn't allowed) to change it. Can
     * be undefined.
     */
    readonly defaultValue?: unknown
    readonly clientParams?: PrintCapabilitiesClientParams
    readonly clientInfo?: PrintCapabilitiesClientInfo
    /**
     * All the scales defined in this attribute, if a clientInfo object is present. It will be an
     * empty array if no clientInfo is defined.
     */
    readonly scales: number[]
    value?: unknown

    /** Flag telling if this layout attribute is valid, and ready to be sent to the backend */
    isValid(): boolean
}

/** Representation of a layout available to be printed on our service-print3 backend */
export interface PrintLayout {
    readonly name: string
    readonly attributes: PrintLayoutAttribute[]

    /**
     * Flag telling of this print layout can be sent to the backend. Meaning all its attributes have
     * a valid value.
     */
    isReadyToPrint(): boolean

    /**
     * Will return all scales defined in the "map" attribute. Will return an empty array if no "map"
     * attribute is found, or if it doesn't contain any scale.
     */
    scales(): number[]
}

export interface PrintConfig {
    attributions?: string[]
    qrCodeUrl: string
    shortLink: string
    layersWithLegends?: Layer[]
    lang: string
    printExtent?: FlatExtent
    layout?: PrintLayout
    scale?: number
    printGrid?: boolean
    projection?: CoordinateSystem
    excludedLayerIDs?: string[]
    dpi?: number
    outputFilename?: string
    legendName?: string
}
