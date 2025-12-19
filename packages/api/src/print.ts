import type {
    MFPEncoder as MFPBaseEncoder,
    MFPReportResponse,
    MFPSpec,
    MFPSymbolizerLine,
    MFPSymbolizerPoint,
    MFPSymbolizerText,
    MFPWmsLayer,
} from '@geoblocks/mapfishprint/lib/types'
import type { GeoJSONFeature } from 'ol/format/GeoJSON'
import type { State } from 'ol/layer/Layer'
import type Map from 'ol/Map'
import type { Size } from 'ol/size'
import type { Image, Stroke, Text } from 'ol/style'

import {
    BaseCustomizer,
    cancelPrint,
    getDownloadUrl,
    MFPEncoder,
    requestReport,
} from '@geoblocks/mapfishprint'
import log from '@swissgeo/log'
import {
    getApi3BaseUrl,
    getViewerDedicatedServicesBaseUrl,
    getWmsBaseUrl,
} from '@swissgeo/staging-config'
import { MIN_PRINT_SCALE_SIZE, PRINT_DPI_COMPENSATION } from '@swissgeo/staging-config/constants'
import axios from 'axios'
import { Circle } from 'ol/style'

import type { PrintCapabilitiesResponse, PrintConfig, PrintLayout } from '@/types/print'

import LogColorPerService from '@/config/log'
import fileProxyAPI from '@/fileProxy'

/** Interval between each polling of the printing job status (ms) */
const PRINTING_DEFAULT_POLL_INTERVAL: number = 2000
/** In ms (= 10 minutes) */
const PRINTING_DEFAULT_POLL_TIMEOUT: number = 600000
const SERVICE_PRINT_URL: string = `${getViewerDedicatedServicesBaseUrl()}print3/print/mapviewer`
/** 1MB in bytes (should be in sync with the backend) */
const MAX_PRINT_SPEC_SIZE: number = 1024 * 1024

const logConfig = (functioName: string) => ({
    title: `Print API / ${functioName}`,
    titleColor: LogColorPerService.print,
})

// Change a width according to the change of DPI (from the old geoadmin)
// Originally introduced here https://github.com/geoadmin/mf-geoadmin3/pull/3280
function adjustWidth(width: number, dpi: number): number {
    if (!width || isNaN(width) || !dpi || isNaN(dpi) || dpi <= 0) {
        return 0
    }
    if (width <= 0) {
        return -adjustWidth(-width, dpi)
    }
    return Math.max((width * PRINT_DPI_COMPENSATION) / dpi, MIN_PRINT_SCALE_SIZE)
}

/**
 * Customizes the printing behavior for GeoAdmin.
 *
 * @extends BaseCustomizer
 */
class GeoAdminCustomizer extends BaseCustomizer {
    readonly layerIDsToExclude: string[]
    readonly printResolution: number

    /**
     * Constructor(layerIDsToExclude, printResolution) {
     *
     * @param printExtent - The extent of the area to be printed. super()
     * @param layerIDsToExclude - An array of layer IDs to exclude from the print.
     * @param printResolution - The resolution for the print.
     */
    constructor(printExtent: number[], layerIDsToExclude: string[], printResolution: number) {
        super(printExtent)
        this.layerIDsToExclude = layerIDsToExclude
        this.printResolution = printResolution
        this.layerFilter = this.layerFilter.bind(this)
        this.geometryFilter = this.geometryFilter.bind(this)
        this.line = this.line.bind(this)
        this.text = this.text.bind(this)
        this.point = this.point.bind(this)
    }

    /**
     * Filter out layers that should not be printed. This function is automatically called when the
     * encodeMap is called using this customizer.
     *
     * @param layerState
     * @returns True to convert this layer, false to skip it
     */
    layerFilter(layerState: State): boolean {
        if (this.layerIDsToExclude.includes(layerState.layer.get('id'))) {
            return false
        }
        // Call the parent's layerFilter method for other layers
        return super.layerFilter(layerState)
    }

    /**
     * Manipulate the symbolizer of a line feature before printing it. In this case replace the
     * strokeDashstyle to dash instead of 8 (measurement line style in the mapfishprint3 backend)
     *
     * @param _state
     * @param _geoJsonFeature
     * @param symbolizer Interface for the symbolizer of a line feature
     * @param _stroke Stroke style of the line feature
     */

    line(
        _state: State,
        _geoJsonFeature: GeoJSONFeature,
        symbolizer: MFPSymbolizerLine,
        _stroke: Stroke
    ) {
        if (symbolizer?.strokeDashstyle === '8') {
            symbolizer.strokeDashstyle = 'dash'
        }
        if (symbolizer.strokeWidth) {
            symbolizer.strokeWidth = adjustWidth(symbolizer.strokeWidth, this.printResolution)
        }
    }

    /**
     * Manipulate the symbolizer of a text style of a feature before printing it.
     *
     * @param _layerState
     * @param _geoJsonFeature
     * @param symbolizer Interface for the symbolizer of a text feature
     * @param text Text style of the feature
     */
    text(
        _layerState: State,
        _geoJsonFeature: GeoJSONFeature,
        symbolizer: MFPSymbolizerText,
        text: Text
    ) {
        symbolizer.haloRadius = adjustWidth(symbolizer.haloRadius, this.printResolution)

        // we try to adapt the font size and offsets to have roughly the same
        // scales on print than on the viewer.
        try {
            symbolizer.labelYOffset = adjustWidth(symbolizer.labelYOffset, this.printResolution)
            symbolizer.labelXOffset = adjustWidth(symbolizer.labelXOffset, this.printResolution)
            let textScale: number = 0
            const originalTextScale = text.getScale()
            if (originalTextScale) {
                if (Array.isArray(originalTextScale) && originalTextScale.length > 0) {
                    textScale = originalTextScale[0]!
                } else if (typeof originalTextScale === 'number') {
                    textScale = originalTextScale
                }
            }
            symbolizer.fontSize = `${adjustWidth(
                parseInt(symbolizer.fontSize) * textScale,
                this.printResolution
            )}px`
        } catch (error) {
            log.debug({
                ...logConfig('GeoAdminCustomizer / text'),
                messages: [
                    'Failed to adapt font size and offsets to print resolution',
                    'Keeping the font family as it is',
                    error,
                ],
            })
        }
    }

    /**
     * Manipulate the symbolizer of a point style of a feature before printing it. In this case it
     * manipulates the width and offset of the image to match the old geoadmin
     *
     * @param _layerState
     * @param _geoJsonFeature
     * @param symbolizer Interface for the symbolizer of a text feature
     * @param image Image style of the feature
     */
    point(
        _layerState: State,
        _geoJsonFeature: GeoJSONFeature,
        symbolizer: MFPSymbolizerPoint,
        image: Image
    ) {
        const scale = image.getScaleArray()[0]
        let size: Size | undefined
        let anchor: number[] | undefined

        // We need to resize the image to match the old geoadmin
        if (symbolizer.externalGraphic) {
            size = image.getSize()
            anchor = image.getAnchor()
            // service print can't handle a proxied url, so we ensure we're
            // giving the original url for the print job.
            symbolizer.externalGraphic = fileProxyAPI.unProxifyUrl(symbolizer.externalGraphic)
        } else if (image instanceof Circle) {
            const radius = image.getRadius()
            const width = adjustWidth(2 * radius, this.printResolution)
            size = [width, width]
            anchor = [width / 2, width / 2]
        }

        if (scale && anchor && anchor.length > 0 && size && size.length > 0) {
            symbolizer.graphicXOffset = symbolizer.graphicXOffset
                ? adjustWidth(
                      (size[0]! / 2 - anchor[0]! + symbolizer.graphicXOffset) * scale,
                      this.printResolution
                  )
                : 0
            // if there is no graphicYOffset, we can't print points
            symbolizer.graphicYOffset = Math.round(1000 * (symbolizer.graphicYOffset ?? 0)) / 1000
        }
        if (scale && size && size.length > 0) {
            symbolizer.graphicWidth = adjustWidth(size[0]! * scale, this.printResolution)
        }
        symbolizer.graphicXOffset = symbolizer.graphicXOffset ?? 0
        symbolizer.graphicYOffset = symbolizer.graphicYOffset ?? 0

        if (symbolizer.fillOpacity === 0.0 && symbolizer.fillColor === '#ff0000') {
            // Handling the case where we need to print a circle in the end of measurement lines
            // It's not rendered in the OpenLayers (opacity == 0.0) but it's needed to be rendered in the print
            symbolizer.fillOpacity = 1
        }
    }
}

/**
 * Tool to transform an OpenLayers map into a "spec" for MapFishPrint3 (meaning a big JSON) that can
 * then be used as request body for printing.
 *
 * @see createPrintJob
 */
const encoder: MFPBaseEncoder = new MFPEncoder(SERVICE_PRINT_URL)

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
            .get<PrintCapabilitiesResponse>(`${SERVICE_PRINT_URL}/capabilities.json`)
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
                                }
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
 * @param olMap OL map
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
async function transformOlMapToPrintParams(olMap: Map, config: PrintConfig): Promise<MFPSpec> {
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
        excludedLayerIDs = [],
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
    const customizer = new GeoAdminCustomizer(printExtent, excludedLayerIDs, dpi)

    const attributionsOneLine = attributions.length > 0 ? `© ${attributions.join(', ')}` : ''
    try {
        const encodedMap = await encoder.encodeMap({
            map: olMap,
            scale,
            printResolution: olMap.getView().getResolution() ?? 0,
            dpi: dpi,
            customizer: customizer,
        })
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
            encodedMap.layers.unshift(wmsLayer)
        }
        const now = new Date()
        const printDate = now.toLocaleString(lang, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })

        const spec: MFPSpec = {
            attributes: {
                map: encodedMap,
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
            spec.attributes.legend = {
                name: legendName ?? 'Legend',
                classes: layersWithLegends.map((layer) => {
                    return {
                        name: layer.name,
                        icons: [`${getApi3BaseUrl()}static/images/legends/${layer.id}_${lang}.png`],
                    }
                }),
            }
        } else {
            spec.attributes.printLegend = 0
        }
        return spec
    } catch (error) {
        log.error({
            ...logConfig('transformOlMapToPrintParams'),
            messages: ["Couldn't encode map to print request", error],
        })
        throw new PrintError(`Couldn't encode map to print request: ${error?.toString()}`)
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
async function createPrintJob(map: Map, config: PrintConfig): Promise<MFPReportResponse> {
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
        const printingSpec = await transformOlMapToPrintParams(map, {
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
            throw new PrintError('Printing spec is too large', 'print_request_too_large')
        }
        log.debug({
            ...logConfig('createPrintJob'),
            messages: ['Starting print for spec', printingSpec],
        })

        return await requestReport(SERVICE_PRINT_URL, printingSpec, printSpecReplacer)
    } catch (error) {
        log.error({
            ...logConfig('createPrintJob'),
            messages: ['Error while creating print job', error],
        })
        if (error instanceof PrintError) {
            throw error
        } else {
            throw new PrintError(`Error while creating print job: ${error?.toString()}`)
        }
    }
}

/**
 * Polls a job and wait for its completion
 *
 * @param printJob
 * @param config
 * @param config.interval Time between each polling of the job in ms. Default is 2000ms (= 2 sec)
 * @param config.timeout Time before the job is deemed timed out in ms. Default is 60000ms (= 10
 *   minutes)
 * @returns {Promise<String>}
 */
async function waitForPrintJobCompletion(
    printJob: MFPReportResponse,
    config?: { interval: number; timeout: number }
): Promise<string> {
    const { interval = PRINTING_DEFAULT_POLL_INTERVAL, timeout = PRINTING_DEFAULT_POLL_TIMEOUT } =
        config ?? {}
    return await getDownloadUrl(SERVICE_PRINT_URL, printJob, interval, timeout)
}

async function abortPrintJob(printJobReference: string): Promise<void> {
    try {
        await cancelPrint(SERVICE_PRINT_URL, printJobReference)
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

    constructor(message: string, key?: string) {
        super(message)
        this.key = key
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
