import {
    BaseCustomizer,
    cancelPrint,
    getDownloadUrl,
    MFPEncoder,
    requestReport,
} from '@geoblocks/mapfishprint'
import axios from 'axios'
import { Circle } from 'ol/style'

import {
    getApi3BaseUrl,
    getViewerDedicatedServicesBaseUrl,
    getWmsBaseUrl,
} from '@/config/baseUrl.config'
import i18n from '@/modules/i18n'
import log from '@/utils/logging'
import { adjustWidth } from '@/utils/styleUtils'

const PRINTING_DEFAULT_POLL_INTERVAL = 2000 // interval between each polling of the printing job status (ms)
const PRINTING_DEFAULT_POLL_TIMEOUT = 600000 // ms (10 minutes)

const SERVICE_PRINT_URL = `${getViewerDedicatedServicesBaseUrl()}print3/print/mapviewer`
const MAX_PRINT_SPEC_SIZE = 1 * 1024 * 1024 // 1MB in bytes (should be in sync with the backend)

class GeoAdminCustomizer extends BaseCustomizer {
    /** @param {string[]} layerIDsToExclude List of layer names to exclude from the print */
    constructor(layerIDsToExclude, printResolution) {
        super()
        this.layerIDsToExclude = layerIDsToExclude
        this.printResolution = printResolution
        this.layerFilter = this.layerFilter.bind(this)
        this.line = this.line.bind(this)
        this.text = this.text.bind(this)
        this.point = this.point.bind(this)
    }

    /**
     * Filter out layers that should not be printed. This function is automatically called when the
     * encodeMap is called using this customizer.
     *
     * @param {State} layerState
     * @returns {boolean} True to convert this layer, false to skip it
     */
    layerFilter(layerState) {
        if (this.layerIDsToExclude.includes(layerState.layer.get('id'))) {
            return false
        }
        // Call parent layerFilter method for other layers
        return super.layerFilter(layerState)
    }

    /**
     * Manipulate the symbolizer of a line feature before printing it. In this case replace the
     * strokeDashstyle to dash instead of 8 (measurement line style in the mapfishprint3 backend)
     *
     * @param {State} layerState
     * @param {GeoJSONFeature} geojsonFeature
     * @param {MFPSymbolizerLine} symbolizer Interface for the symbolizer of a line feature
     * @param {Stroke} stroke Stroke style of the line feature
     */
    // eslint-disable-next-line no-unused-vars
    line(layerState, geojsonFeature, symbolizer, stroke) {
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
     * @param {State} layerState
     * @param {GeoJSONFeature} geojsonFeature
     * @param {MFPSymbolizerText} symbolizer Interface for the symbolizer of a text feature
     * @param {Text} text Text style of the feature
     */
    // eslint-disable-next-line no-unused-vars
    text(layerState, geojsonFeature, symbolizer, text) {
        symbolizer.pointRadius = adjustWidth(symbolizer.pointRadius, this.printResolution)
        symbolizer.strokeWidth = adjustWidth(symbolizer.strokeWidth, this.printResolution)
        symbolizer.haloRadius = adjustWidth(symbolizer.haloRadius, this.printResolution)
        symbolizer.conflictResolution = false
        symbolizer.fontSize =
            Math.ceil(2 * adjustWidth(parseInt(symbolizer.fontSize), this.printResolution)) + 'px'

        // we try to adapt the font size and offsets to have roughly the same
        // scales on print than on the viewer.
        try {
            symbolizer.labelYOffset = symbolizer.labelYOffset
                ? adjustWidth(symbolizer.labelYOffset, this.printResolution)
                : 0
            symbolizer.labelXOffset = symbolizer.labelXOffset
                ? adjustWidth(symbolizer.labelXOffset, this.printResolution)
                : 0
            symbolizer.fontSize = `${adjustWidth(
                parseInt(symbolizer.fontSize) * text.getScale(),
                this.printResolution
            )}px`
        } catch (error) {
            // Keep the font family as it is
        }
    }

    /**
     * Manipulate the symbolizer of a point style of a feature before printing it. In this case it
     * manipulate the width and offset of the image to match the old geoadmin
     *
     * @param {State} layerState
     * @param {GeoJSONFeature} geojsonFeature
     * @param {MFPSymbolizerPoint} symbolizer Interface for the symbolizer of a text feature
     * @param {Image} image Image style of the feature
     */
    // eslint-disable-next-line no-unused-vars
    point(layerState, geojsonFeature, symbolizer, image) {
        const scale = image.getScaleArray()[0]
        let size = null
        let anchor = null

        // We need to resize the image to match the old geoadmin
        if (symbolizer.externalGraphic) {
            size = image.getSize()
            anchor = image.getAnchor()
        } else if (image instanceof Circle) {
            const radius = image.getRadius()
            const width = adjustWidth(2 * radius, this.printResolution)
            size = [width, width]
            anchor = [width / 2, width / 2]
        }

        if (anchor) {
            symbolizer.graphicXOffset = symbolizer.graphicXOffset
                ? adjustWidth(
                      (size[0] / 2 - anchor[0] + symbolizer.graphicXOffset) * scale,
                      this.printResolution
                  )
                : 0
            // don't ask why it works, but that's the best I could do.

            symbolizer.graphicYOffset = symbolizer.graphicYOffset
                ? (symbolizer.graphicYOffset = adjustWidth(-size[1], this.printResolution))
                : 0
        }
        if (size) {
            symbolizer.graphicWidth = adjustWidth(size[0] * scale, this.printResolution)
        }
        symbolizer.graphicXOffset = symbolizer.graphicXOffset ? symbolizer.graphicXOffset : 0
        symbolizer.graphicYOffset = symbolizer.graphicYOffset ? symbolizer.graphicYOffset : 0

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
 * @type {MFPBaseEncoder}
 * @see createPrintJob
 */
const encoder = new MFPEncoder(SERVICE_PRINT_URL)

/**
 * One parameter required to start a print job.
 *
 * This is where information about print capabilities for a specific layout will be stored (inside
 * the clientInfo object), e.g. which scales can be used on the map, available DPIs, etc...
 */
export class PrintLayoutAttribute {
    constructor(name, type, defaultValue = null, clientParams = null, clientInfo = null) {
        this.name = name
        this.type = type
        this.defaultValue = defaultValue
        this.clientParams = clientParams
        this.clientInfo = clientInfo
        this.value = defaultValue
    }

    /**
     * Flag telling of this layout attribute must be filled before sending a print job with its
     * layout
     *
     * @returns {boolean}
     */
    get isRequired() {
        return this.defaultValue === null
    }

    /**
     * Flag telling if this layout attribute is valid, and ready to be sent to the backend
     *
     * @returns {boolean}
     */
    get isValid() {
        return this.defaultValue !== null || this.value !== null
    }

    /**
     * Returns all the scales defined in this attribute, if a clientInfo object is present. It will
     * return an empty array if no clientInfo is defined.
     *
     * @returns {Number[]}
     */
    get scales() {
        return this.clientInfo?.scales || []
    }
}

/** Representation of a layout available to be printed on our service-print3 backend */
export class PrintLayout {
    /**
     * @param {String} name
     * @param {PrintLayoutAttribute} attributes
     */
    constructor(name, ...attributes) {
        this.name = name
        this.attributes = attributes.filter(
            (attribute) => attribute instanceof PrintLayoutAttribute
        )
    }

    /**
     * Flag telling of this print layout can be sent to the backend. Meaning all its attributes have
     * a valid value.
     *
     * @returns {boolean}
     */
    get isReadyToPrint() {
        return !this.attributes.some((attribute) => !attribute.isValid)
    }

    /**
     * Will returns all scales defined in the "map" attribute. Will return an empty array if no
     * "map" attribute is found, or if it doesn't contain any scale.
     *
     * @returns {Number[]}
     */
    get scales() {
        return this.attributes.find((attribute) => attribute.name === 'map')?.scales || []
    }
}

/** @returns Promise<PrintLayout[]> */
export function readPrintCapabilities() {
    return new Promise((resolve, reject) => {
        axios
            .get(`${SERVICE_PRINT_URL}/capabilities.json`)
            .then((response) => response.data)
            .then((capabilities) => {
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
                log.error('Error while loading print capabilities', error)
                reject(error)
            })
    })
}

/**
 * Error when requesting a printing of the map
 *
 * This class also contains an i18n translation key in plus of a technical english message. The
 * translation key can be used to display a translated user message.
 *
 * @property {String} message Technical english message
 * @property {String} key I18n translation key for a user message
 */
export class PrintError extends Error {
    constructor(message, key) {
        super(message)
        this.key = key
        this.name = 'PrintError'
    }
}

/**
 * @param {Map} olMap OL map
 * @param {String[]} [config.attributions=[]] List of all attributions of layers currently visible
 *   on the map. Default is `[]`
 * @param {String} config.qrCodeUrl URL to a QR-code encoded short link of the current view of the
 *   map
 * @param {AbstractLayer[]} [config.layersWithLegends=[]] Layers that have legends that must be
 *   added to the map. Default is `[]`
 * @param {String} config.lang Current lang of the map expressed as ISO code
 * @param {PrintLayout} config.layout Current printing layout selected by the user
 * @param {Number} config.scale Current scale selected by the user to print the map, must be part of
 *   the possible scales of the printing layout
 * @param {Boolean} [config.printGrid=false] Whether the coordinate grid should be printed or not.
 *   Default is `false`
 * @param {CoordinateSystem} [config.projection=null] The projection used by the map, necessary when
 *   the grid is to be printed (it can otherwise be null). Default is `null`
 * @param {String[]} [config.excludedLayerIDs=[]] List of the IDs of OpenLayers layer to exclude
 *   from the print. Default is `[]`
 * @param {String | null} [config.dpi=null] The DPI of the printed map. Default is `null`
 * @param {String | null} [config.outputFilename=null] Output file name, without extension. When
 *   null, let the server decide. Default is `null`
 */
async function transformOlMapToPrintParams(olMap, config) {
    const {
        attributions = [],
        qrCodeUrl = null,
        shortLink = null,
        layout = null,
        scale = null,
        layersWithLegends = [],
        lang = null,
        printGrid = false,
        projection = null,
        excludedLayerIDs = [],
        dpi = null,
        outputFilename = null,
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
    if (printGrid && !projection) {
        throw new PrintError('Missing projection to print the grid')
    }
    if (!dpi) {
        throw new PrintError('Missing DPI for printing')
    }
    const customizer = new GeoAdminCustomizer(excludedLayerIDs, dpi)
    const attributionsOneLine = attributions.length > 0 ? `© ${attributions.join(', ')}` : ''

    try {
        const encodedMap = await encoder.encodeMap({
            map: olMap,
            scale,
            printResolution: olMap.getView().getResolution(),
            dpi: dpi,
            customizer: customizer,
        })
        // Note (IS): This is a dirty fix to handle empty text annotation. See PB-790
        // It should be removed once the issue is fixed in the mapfishprint library
        encodedMap.layers.forEach((layer) => {
            layer.geoJson?.features?.forEach((feature) => {
                // Delete the editableFeature property because it will cause an error in the mapfishprint
                // Should be handled inside GeoAdminCustomizer.feature but it skip the feature with empty text
                delete feature.properties?.editableFeature
            })
        })
        if (printGrid) {
            encodedMap.layers.unshift({
                baseURL: getWmsBaseUrl(),
                opacity: 1,
                singleTile: true,
                type: 'WMS',
                layers: [`org.epsg.grid_${projection.epsgNumber}`],
                format: 'image/png',
                styles: [''],
                customParams: {
                    TRANSPARENT: true,
                    // Notes(IS): The coordinate grid is cutted off if we use the same resolution as the DPI.
                    // This value is a bit smaller than the DPI to avoid this issue.
                    MAP_RESOLUTION: Math.floor(dpi * 0.85),
                },
            })
        }
        const now = i18n.global.d(new Date(), 'datetime', i18n.global.locale)
        const spec = {
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
        log.error("Couldn't encode map to print request", error)
        throw new PrintError(`Couldn't encode map to print request: ${error}`)
    }
}

/**
 * Replacer function to manipulate some properties from the printing spec before sending it to the
 * printing service. It is used as a parameter for JSON.stringify in the requestReport function. See
 * more
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter
 */
function printSpecReplacer(key, value) {
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
 * @param {Map} map OL map
 * @param {PrintLayout} config.layout Current printing layout selected by the user
 * @param {Number} config.scale Current scale selected by the user to print the map, must be part of
 *   the possible scales of the printing layout
 * @param {String[]} [config.attributions=[]] List of all attributions of layers currently visible
 *   on the map. Default is `[]`
 * @param {String} config.qrCodeUrl URL to a QR-code encoded short link of the current view of the
 *   map
 * @param {AbstractLayer[]} [config.layersWithLegends=[]] Layers that have legends that must be
 *   added to the map. Default is `[]`
 * @param {String} config.lang Current lang of the map expressed as ISO code
 * @param {Boolean} [config.printGrid=false] Whether the coordinate grid should be printed or not.
 *   Default is `false`
 * @param {CoordinateSystem} [config.projection=null] The projection used by the map, necessary when
 *   the grid is to be printed (it can otherwise be null). Default is `null`
 * @param {String[]} [config.excludedLayerIDs=[]] List of IDs of OpenLayers layer to exclude from
 *   the print. Default is `[]`
 * @param {String | null} [config.outputFilename=null] Output file name, without extension. When
 *   null, let the server decide. Default is `null`
 * @param {String | null} [config.dpi=null] The DPI of the printed map. Default is `null`
 * @returns {Promise<MFPReportResponse>} A job running on our printing backend (needs to be polled
 *   using {@link waitForPrintJobCompletion} to wait until its completion)
 */
export async function createPrintJob(map, config) {
    const {
        layout = null,
        scale = null,
        attributions = [],
        qrCodeUrl = null,
        shortLink = null,
        layersWithLegends = [],
        lang = null,
        printGrid = false,
        projection = null,
        excludedLayerIDs = [],
        outputFilename = null,
        dpi = null,
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
            projection,
            excludedLayerIDs,
            outputFilename,
            dpi,
        })
        if (!isPrintingSpecSizeValid(printingSpec)) {
            throw new PrintError('Printing spec is too large', 'print_request_too_large')
        }
        log.debug('Starting print for spec', printingSpec)

        return await requestReport(SERVICE_PRINT_URL, printingSpec, printSpecReplacer)
    } catch (error) {
        log.error('Error while creating print job', error)
        if (error instanceof PrintError) {
            throw error
        } else {
            throw new PrintError(`Error while creating print job: ${error}`)
        }
    }
}

/**
 * Polls a job and wait for its completion
 *
 * @param {MFPReportResponse} printJob
 * @param {Number} config.interval Time between each polling of the job in ms. Default is 2000ms
 *   (=2sec)
 * @param {Number} config.timeout Time before the job is deemed timed out in ms. Default is 60000ms
 *   (=10minutes)
 * @returns {Promise<String>}
 */
export async function waitForPrintJobCompletion(printJob, config = {}) {
    const { interval = PRINTING_DEFAULT_POLL_INTERVAL, timeout = PRINTING_DEFAULT_POLL_TIMEOUT } =
        config
    return await getDownloadUrl(SERVICE_PRINT_URL, printJob, interval, timeout)
}

/**
 * @param {String} printJobReference
 * @returns {Promise<void>}
 */
export async function abortPrintJob(printJobReference) {
    try {
        await cancelPrint(SERVICE_PRINT_URL, printJobReference)
    } catch (error) {
        log.error('Could not abort print job', error)
        throw new PrintError('Could not abort print job')
    }
}
/**
 * Check if the size of the printing spec is not bigger than MAX_PRINT_SPEC_SIZE
 *
 * @param {Object} printingSpec
 * @returns {boolean} True if not bigger than MAX_PRINT_SPEC_SIZE, false otherwise
 */
function isPrintingSpecSizeValid(printingSpec) {
    const jsonString = JSON.stringify(printingSpec, printSpecReplacer)
    const byteLength = new TextEncoder().encode(jsonString).length

    return byteLength <= MAX_PRINT_SPEC_SIZE
}
