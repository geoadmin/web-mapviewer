import type {
    MFPEncoder as MFPBaseEncoder,
    MFPReportResponse,
    MFPSpec,
    MFPSymbolizerLine,
    MFPSymbolizerPoint,
    MFPSymbolizerText,
    MFPWmsLayer,
} from '@geoblocks/mapfishprint/lib/types'
import type { CoordinateSystem, FlatExtent } from '@swissgeo/coordinates'
import type { Layer } from '@swissgeo/layers'
import type { GeoJSONFeature } from 'ol/format/GeoJSON'
import type { State } from 'ol/layer/Layer'
import type Map from 'ol/Map'
import type { Size } from 'ol/size'

import {
    BaseCustomizer,
    cancelPrint,
    getDownloadUrl,
    MFPEncoder,
    requestReport,
} from '@geoblocks/mapfishprint'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import axios from 'axios'
import { Circle, type Image, type Stroke, type Text } from 'ol/style'

import { unProxifyUrl } from '@/api/file-proxy.api'
import {
    getApi3BaseUrl,
    getViewerDedicatedServicesBaseUrl,
    getWmsBaseUrl,
} from '@/config/baseUrl.config'
import i18n from '@/modules/i18n'
import { useI18nStore } from '@/store/modules/i18n.store'
import { adjustWidth } from '@/utils/styleUtils'

/** Interval between each polling of the printing job status (ms) */
const PRINTING_DEFAULT_POLL_INTERVAL: number = 2000
/** In ms (= 10 minutes) */
const PRINTING_DEFAULT_POLL_TIMEOUT: number = 600000
const SERVICE_PRINT_URL: string = `${getViewerDedicatedServicesBaseUrl()}print3/print/mapviewer`
/** 1MB in bytes (should be in sync with the backend) */
const MAX_PRINT_SPEC_SIZE: number = 1024 * 1024

const LOG_COLOR: LogPreDefinedColor = LogPreDefinedColor.Emerald

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
                title: 'Print API / GeoAdminCustomizer / text',
                titleStyle: {
                    backgroundColor: LOG_COLOR,
                },
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
            symbolizer.externalGraphic = unProxifyUrl(symbolizer.externalGraphic)
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

/**
 * Bunch of key/values to be passed to the service-print3 backend, when printing the layout these
 * params come attached with.
 */
interface PrintCapabilitiesClientParams {
    [key: string]: unknown
}

/** Information to show the "client" (aka the user) when selecting a layout */
interface PrintCapabilitiesClientInfo {
    dpiSuggestions: number[]
    scales: number[]
    maxDPI: number
    width: number
    height: number
}

/**
 * One parameter (out of many), required to start a print job.
 *
 * This is where information about print capabilities for a specific layout will be stored (inside
 * the clientInfo object), e.g. which scales can be used on the map, available DPIs, etc...
 */
export class PrintLayoutAttribute {
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
    readonly defaultValue: unknown
    readonly clientParams: PrintCapabilitiesClientParams | undefined
    readonly clientInfo: PrintCapabilitiesClientInfo | undefined
    value: unknown

    constructor(
        name: string,
        type: string,
        defaultValue?: unknown,
        clientParams?: PrintCapabilitiesClientParams,
        clientInfo?: PrintCapabilitiesClientInfo
    ) {
        this.name = name
        this.type = type
        this.defaultValue = defaultValue
        this.clientParams = clientParams
        this.clientInfo = clientInfo
        this.value = defaultValue
    }

    /** Flag telling if this layout attribute is valid, and ready to be sent to the backend */
    get isValid(): boolean {
        return this.defaultValue !== undefined || this.value !== undefined
    }

    /**
     * Returns all the scales defined in this attribute, if a clientInfo object is present. It will
     * return an empty array if no clientInfo is defined.
     */
    get scales(): number[] {
        return this.clientInfo?.scales || []
    }
}

/** Representation of a layout available to be printed on our service-print3 backend */
export class PrintLayout {
    readonly name: string
    readonly attributes: PrintLayoutAttribute[]

    constructor(name: string, ...attributes: PrintLayoutAttribute[]) {
        this.name = name
        this.attributes = attributes.filter(
            (attribute) => attribute instanceof PrintLayoutAttribute
        )
    }

    /**
     * Flag telling of this print layout can be sent to the backend. Meaning all its attributes have
     * a valid value.
     */
    get isReadyToPrint(): boolean {
        return !this.attributes.some((attribute) => !attribute.isValid)
    }

    /**
     * Will return all scales defined in the "map" attribute. Will return an empty array if no "map"
     * attribute is found, or if it doesn't contain any scale.
     */
    get scales(): number[] {
        return this.attributes.find((attribute) => attribute.name === 'map')?.scales || []
    }
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

interface PrintCapabilitiesLayerAttribute {
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

interface PrintCapabilitiesLayer {
    name: string
    attributes: PrintCapabilitiesLayerAttribute[]
}

interface PrintCapabilitiesResponse {
    app: string
    layouts: PrintCapabilitiesLayer[]
    smtp: {
        enabled: boolean
    }
    formats: string[]
}

export function readPrintCapabilities(): Promise<PrintLayout[]> {
    return new Promise((resolve, reject) => {
        axios
            .get<PrintCapabilitiesResponse>(`${SERVICE_PRINT_URL}/capabilities.json`)
            .then((response) => response.data)
            .then((capabilities) => {
                if (!validateBackendResponse(capabilities)) {
                    log.error({
                        title: 'Print API / readPrintCapabilities',
                        titleStyle: {
                            backgroundColor: LOG_COLOR,
                        },
                        messages: ['Bad print capabilities response', capabilities],
                    })
                    reject(new Error('Bad print capabilities response'))
                    return
                }
                resolve(
                    capabilities?.layouts.map((layout) => {
                        return new PrintLayout(
                            layout.name,
                            ...layout.attributes.map((attribute) => {
                                return new PrintLayoutAttribute(
                                    attribute.name,
                                    attribute.type,
                                    attribute.default,
                                    attribute.clientParams,
                                    attribute.clientInfo
                                )
                            })
                        )
                    })
                )
            })
            .catch((error) => {
                log.error({
                    title: 'Print API / readPrintCapabilities',
                    titleStyle: {
                        backgroundColor: LOG_COLOR,
                    },
                    messages: ['Error while loading print capabilities', error],
                })
                reject(new Error(error))
            })
    })
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

interface PrintConfig {
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
    const i18nStore = useI18nStore()

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
        const now = i18n.global.d(new Date(), 'datetime', i18nStore.lang)

        const spec: MFPSpec = {
            attributes: {
                map: encodedMap,
                copyright: attributionsOneLine,
                url: shortLink,
                qrimage: qrCodeUrl,
                printDate: now,
            },
            format: 'pdf',
            layout: layout.name,
            lang,
            outputFilename,
        }
        if (layersWithLegends.length > 0) {
            spec.attributes.legend = {
                name: i18n.global.t('legend'),
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
            title: 'Prtin API / transformOlMapToPrintParams',
            titleStyle: {
                backgroundColor: LOG_COLOR,
            },
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
export async function createPrintJob(map: Map, config: PrintConfig): Promise<MFPReportResponse> {
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
            title: 'Print API / createPrintJob',
            titleStyle: {
                backgroundColor: LOG_COLOR,
            },
            messages: ['Starting print for spec', printingSpec],
        })

        return await requestReport(SERVICE_PRINT_URL, printingSpec, printSpecReplacer)
    } catch (error) {
        log.error({
            title: 'Print API / createPrintJob',
            titleStyle: {
                backgroundColor: LOG_COLOR,
            },
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
export async function waitForPrintJobCompletion(
    printJob: MFPReportResponse,
    config?: { interval: number; timeout: number }
): Promise<string> {
    const { interval = PRINTING_DEFAULT_POLL_INTERVAL, timeout = PRINTING_DEFAULT_POLL_TIMEOUT } =
        config ?? {}
    return await getDownloadUrl(SERVICE_PRINT_URL, printJob, interval, timeout)
}

export async function abortPrintJob(printJobReference: string): Promise<void> {
    try {
        await cancelPrint(SERVICE_PRINT_URL, printJobReference)
    } catch (error) {
        log.error({
            title: 'Print API / abortPrintJob',
            titleStyle: {
                backgroundColor: LOG_COLOR,
            },
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
