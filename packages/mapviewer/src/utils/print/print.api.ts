import type { MFPLegend } from '@geoblocks/mapfishprint'
import type {
    MFPMap,
    MFPReportResponse,
    MFPSpec,
    MFPWmsLayer,
} from '@geoblocks/mapfishprint/lib/types'
import type { ExternalLayer } from '@swissgeo/layers'

import { cancelPrint, getDownloadUrl, requestReport } from '@geoblocks/mapfishprint'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import {
    getApi3BaseUrl,
    getViewerDedicatedServicesBaseUrl,
    getWmsBaseUrl,
} from '@swissgeo/staging-config'
import axios from 'axios'

import type {
    PrintCapabilitiesResponse,
    PrintConfig,
    PrintLayout,
    PrintLayoutAttribute,
} from '@/utils/print/types'

import { ENVIRONMENT } from '@/config'

/** Interval between each polling of the printing job status (ms) */
const PRINTING_DEFAULT_POLL_INTERVAL: number = 2000
/** In ms (= 10 minutes) */
const PRINTING_DEFAULT_POLL_TIMEOUT: number = 600000
/** 1MB in bytes (should be in sync with the backend) */
const MAX_PRINT_SPEC_SIZE: number = 1024 * 1024

const logConfig = (functioName: string) => ({
    title: `Print API / ${functioName}`,
    titleColor: LogPreDefinedColor.Emerald,
})

function getServicePrintURL() {
    return `${getViewerDedicatedServicesBaseUrl(ENVIRONMENT)}print3/print/mapviewer`
}

function validateBackendResponse(response: PrintCapabilitiesResponse): boolean {
    if (
        !('layouts' in response) ||
        !Array.isArray(response.layouts) ||
        response.layouts.length === 0
    ) {
        return false
    }
    const layouts = response.layouts.filter((layout) => {
        return (
            'name' in layout &&
            typeof layout.name === 'string' &&
            'attributes' in layout &&
            Array.isArray(layout.attributes)
        )
    })
    if (layouts.length === 0) {
        return false
    }
    for (const attributes of layouts.map((layout) => layout.attributes)) {
        if (!Array.isArray(attributes)) {
            return false
        }
        for (const attribute of attributes) {
            if (
                !('name' in attribute) ||
                typeof attribute.name !== 'string' ||
                !('type' in attribute) ||
                typeof attribute.type !== 'string'
            ) {
                return false
            }
        }
    }
    return true
}

function readPrintCapabilities(): Promise<PrintLayout[]> {
    return new Promise((resolve, reject) => {
        axios
            .get<PrintCapabilitiesResponse>(`${getServicePrintURL()}/capabilities.json`)
            .then((response) => response.data)
            .then((capabilities) => {
                if (!validateBackendResponse(capabilities)) {
                    log.error({
                        ...logConfig('readPrintCapabilities'),
                        messages: ['Bad print capabilities response', capabilities],
                    })
                    reject(new Error('Bad print capabilities response'))
                    return
                }
                resolve(
                    capabilities?.layouts.map((layout) => {
                        return {
                            name: layout.name,
                            attributes: layout.attributes.map((attribute) => {
                                return {
                                    name: attribute.name,
                                    type: attribute.type,
                                    value: undefined,
                                    defaultValue: attribute.default,
                                    clientParams: attribute.clientParams,
                                    clientInfo: attribute.clientInfo,
                                    scales: attribute.clientInfo?.scales ?? [],
                                    isValid: function () {
                                        return (
                                            this.defaultValue !== undefined ||
                                            this.value !== undefined
                                        )
                                    },
                                } as PrintLayoutAttribute
                            }),
                            isReadyToPrint: function () {
                                return !this.attributes.some((attribute) => !attribute.isValid)
                            },
                            scales: function () {
                                return (
                                    this.attributes.find((attribute) => attribute.name === 'map')
                                        ?.scales || []
                                )
                            },
                        }
                    })
                )
            })
            .catch((error) => {
                log.error({
                    ...logConfig('readPrintCapabilities'),
                    messages: ['Error while loading print capabilities', error],
                })
                reject(new Error(error))
            })
    })
}

/**
 * @param map OpenLayers map encoded with @geoblocks/mapfishprint utils
 * @param config
 * @param config.attributions List of all attributions of layers currently visible on the map.
 * @param config.qrCodeUrl URL to a QR-code encoded short link of the current view of the map
 * @param config.shortLink Short URL to the current state of the app
 * @param config.layersWithLegends Layers that have legends that must be added to the map.
 * @param config.lang Current lang of the map expressed as ISO code
 * @param config.layout Current printing layout selected by the user
 * @param config.scale Current scale selected by the user to print the map, must be part of the
 *   possible scales of the printing layout
 * @param config.printGrid Whether the coordinate grid should be printed or not.
 * @param config.projection The projection used by the map, necessary when the grid is to be printed
 *   (it can otherwise be null).
 * @param config.dpi The DPI of the printed map.
 * @param config.outputFilename Output file name, without extension. When null, let the server
 *   decide.
 */
function transformOlMapToPrintParams(map: MFPMap, config: PrintConfig): MFPSpec {
    const {
        attributions = [],
        qrCodeUrl,
        shortLink,
        layout,
        scale,
        layersWithLegends = [],
        lang,
        printExtent,
        printGrid,
        projection,
        dpi,
        outputFilename,
        legendName,
    } = config

    if (!qrCodeUrl) {
        throw new PrintError('Missing QR code URL')
    }
    if (!shortLink) {
        throw new PrintError('Missing short link')
    }
    if (!layout) {
        throw new PrintError('Missing layout')
    }
    if (!scale) {
        throw new PrintError('Missing scale')
    }
    if (!lang) {
        throw new PrintError('Missing lang')
    }
    if (!printExtent) {
        throw new PrintError('Missing print extent')
    }
    if (printGrid && !projection) {
        throw new PrintError('Missing projection to print the grid')
    }
    if (!dpi) {
        throw new PrintError('Missing DPI for printing')
    }

    const attributionsOneLine = attributions.length > 0 ? `© ${attributions.join(', ')}` : ''
    try {
        if (printGrid && projection) {
            const wmsLayer: MFPWmsLayer = {
                name: 'Grid layer',
                baseURL: getWmsBaseUrl(),
                opacity: 1,
                type: 'wms',
                layers: [`org.epsg.grid_${projection.epsgNumber}`],
                imageFormat: 'image/png',
                styles: [''],
                serverType: 'mapserver',
                version: '1.3.0',
                useNativeAngle: true,
                customParams: {
                    singleTile: 'true',
                    TRANSPARENT: 'true',
                    // Notes(IS): The coordinate grid is cut off if we use the same resolution as the DPI.
                    // This value is a bit smaller than the DPI to avoid this issue.
                    MAP_RESOLUTION: Math.floor(dpi * 0.85).toString(),
                },
            }
            map.layers.unshift(wmsLayer)
        }
        const now = new Date()
        const printDate = now.toLocaleString(lang, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })

        const spec: MFPSpec = {
            attributes: {
                map,
                copyright: attributionsOneLine,
                url: shortLink,
                qrimage: qrCodeUrl,
                printDate,
            },
            format: 'pdf',
            layout: layout.name,
            lang,
            outputFilename,
        }
        if (layersWithLegends.length > 0) {
            const transformedLegends: MFPLegend[] = layersWithLegends
                .flatMap((layer) => {
                    if (layer.isExternal) {
                        return (layer as ExternalLayer).legends?.map((legend) => {
                            return {
                                name: layer.name,
                                icons: [legend.url],
                            }
                        })
                    } else {
                        return {
                            name: layer.name,
                            icons: [
                                `${getApi3BaseUrl(ENVIRONMENT)}static/images/legends/${layer.id}_${lang}.png`,
                            ],
                        }
                    }
                })
                .filter((legend) => legend !== undefined)
            spec.attributes.legend = {
                name: legendName ?? 'Legend',
                classes: transformedLegends,
            }
            spec.attributes.printLegend = transformedLegends.length > 0 ? 1 : 0
        } else {
            spec.attributes.printLegend = 0
        }
        return spec
    } catch (error) {
        log.error({
            ...logConfig('transformOlMapToPrintParams'),
            messages: ["Couldn't encode map to print request", error],
        })
        throw new PrintError("Couldn't encode map to print request", { cause: error })
    }
}

/**
 * Replacer function to manipulate some properties from the printing spec before sending it to the
 * printing service. It is used as a parameter for JSON.stringify in the requestReport function. See
 * more
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter
 */
function printSpecReplacer(key: string, value: unknown): unknown {
    // Remove the "bad" property from the feature
    const badKeys = [
        'editableFeature', // unnecessary properties for printing but cause mapfishprint to throw an error
        'geodesic', // cause circular reference issues on JSON.stringify
    ]
    if (badKeys.includes(key)) {
        return undefined
    }
    return value
}

/**
 * Lauches a print job on our backend with the given configuration. This job then needs to be polled
 * by {@link waitForPrintJobCompletion}
 *
 * @param map OL map
 * @param config
 * @param config.attributions List of all attributions of layers currently visible on the map.
 * @param config.qrCodeUrl URL to a QR-code encoded short link of the current view of the map
 * @param config.shortLink Short URL to the current state of the app
 * @param config.layersWithLegends Layers that have legends that must be added to the map.
 * @param config.lang Current lang of the map expressed as ISO code
 * @param config.layout Current printing layout selected by the user
 * @param config.scale Current scale selected by the user to print the map, must be part of the
 *   possible scales of the printing layout
 * @param config.printGrid Whether the coordinate grid should be printed or not.
 * @param config.projection The projection used by the map, necessary when the grid is to be printed
 *   (it can otherwise be null).
 * @param config.excludedLayerIDs List of the IDs of OpenLayers layer to exclude from the print.
 * @param config.dpi The DPI of the printed map.
 * @param config.outputFilename Output file name, without extension. When null, let the server
 *   decide.
 */
async function createPrintJob(map: MFPMap, config: PrintConfig): Promise<MFPReportResponse> {
    const {
        layout,
        scale,
        attributions,
        qrCodeUrl,
        shortLink,
        layersWithLegends,
        lang,
        printGrid,
        printExtent,
        projection,
        excludedLayerIDs,
        outputFilename,
        dpi,
    } = config
    try {
        const printingSpec = transformOlMapToPrintParams(map, {
            attributions,
            qrCodeUrl,
            shortLink,
            layout,
            scale,
            layersWithLegends,
            lang,
            printGrid,
            printExtent,
            projection,
            excludedLayerIDs,
            outputFilename,
            dpi,
        })
        if (!isPrintingSpecSizeValid(printingSpec)) {
            throw new PrintError('Printing spec is too large', { key: 'print_request_too_large' })
        }
        log.debug({
            ...logConfig('createPrintJob'),
            messages: ['Starting print for spec', printingSpec],
        })

        return await requestReport(getServicePrintURL(), printingSpec, printSpecReplacer)
    } catch (error) {
        log.error({
            ...logConfig('createPrintJob'),
            messages: ['Error while creating print job', error],
        })
        if (error instanceof PrintError) {
            throw error
        } else {
            throw new PrintError('Error while creating print job', { cause: error })
        }
    }
}

/**
 * Polls a job and wait for its completion
 *
 * @param printJob
 * @returns {Promise<String>}
 */
async function waitForPrintJobCompletion(printJob: MFPReportResponse): Promise<string> {
    return await getDownloadUrl(
        getServicePrintURL(),
        printJob,
        PRINTING_DEFAULT_POLL_INTERVAL,
        PRINTING_DEFAULT_POLL_TIMEOUT
    )
}

async function abortPrintJob(printJobReference: string): Promise<void> {
    try {
        await cancelPrint(getServicePrintURL(), printJobReference)
    } catch (error) {
        log.error({
            ...logConfig('abortPrintJob'),
            messages: ['Could not abort print job', error],
        })
        throw new PrintError('Could not abort print job')
    }
}

/**
 * Check if the size of the printing spec is not bigger than MAX_PRINT_SPEC_SIZE
 *
 * @returns True if not bigger than MAX_PRINT_SPEC_SIZE, false otherwise
 */
function isPrintingSpecSizeValid(printingSpec: MFPSpec): boolean {
    const jsonString = JSON.stringify(printingSpec, printSpecReplacer)
    const byteLength = new TextEncoder().encode(jsonString).length

    return byteLength <= MAX_PRINT_SPEC_SIZE
}

/**
 * Error when requesting a printing of the map
 *
 * This class also contains an i18n translation key in plus of a technical english message. The
 * translation key can be used to display a translated user message.
 */
export class PrintError extends Error {
    /** I18n translation key for a user message */
    readonly key: string | undefined
    readonly name: string

    constructor(message: string, options?: { key?: string; cause?: unknown }) {
        super(message, { cause: options?.cause })
        this.key = options?.key
        this.name = 'PrintError'
    }
}

export const printAPI = {
    readPrintCapabilities,
    createPrintJob,
    waitForPrintJobCompletion,
    abortPrintJob,
}
export default printAPI
