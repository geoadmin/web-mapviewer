import {
    BaseCustomizer,
    cancelPrint,
    getDownloadUrl,
    MFPEncoder,
    requestReport,
} from '@geoblocks/mapfishprint'
import axios from 'axios'

import { API_BASE_URL, API_SERVICES_BASE_URL, WMS_BASE_URL } from '@/config'
import i18n from '@/modules/i18n'
import log from '@/utils/logging'

const PRINTING_RESOLUTION = 96 // dpi
const PRINTING_DEFAULT_POLL_INTERVAL = 2000 // interval between each polling of the printing job status (ms)
const PRINTING_DEFAULT_POLL_TIMEOUT = 600000 // ms (10 minutes)

const SERVICE_PRINT_URL = `${API_SERVICES_BASE_URL}print3/print/default`
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

    const attributionsOneLine = attributions.length > 0 ? `© ${attributions.join(', ')}` : ''

    try {
        const encodedMap = await encoder.encodeMap({
            map: olMap,
            scale,
            printResolution: PRINTING_RESOLUTION,
            dpi: PRINTING_RESOLUTION,
            customizer: new BaseCustomizer([0, 0, 10000, 10000]),
        })
        if (printGrid) {
            encodedMap.layers.unshift({
                baseURL: WMS_BASE_URL,
                opacity: 1,
                singleTile: true,
                type: 'WMS',
                layers: [`org.epsg.grid_${projection.epsgNumber}`],
                format: 'image/png',
                styles: [''],
                customParams: {
                    TRANSPARENT: true,
                    MAP_RESOLUTION: PRINTING_RESOLUTION,
                },
            })
        }

        const spec = {
            attributes: {
                map: encodedMap,
                copyright: attributionsOneLine,
                url: shortLink,
                qrimage: qrCodeUrl,
            },
            format: 'pdf',
            layout: layout.name,
        }
        if (layersWithLegends.length > 0) {
            spec.attributes.legends = {
                name: i18n.global.t('legend'),
                classes: layersWithLegends.map((layer) => {
                    return {
                        name: layer.name,
                        icons: [`${API_BASE_URL}static/images/legends/${layer.id}_${lang}.png`],
                    }
                }),
            }
        } else {
            spec.attributes.printLegend = 0
        }
        return spec
    } catch (error) {
        log.error("Couldn't encode map to print request", error)
        throw new PrintError('Failed to print the map')
    }
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
        })
        log.debug('Starting print for spec', printingSpec)
        return await requestReport(SERVICE_PRINT_URL, printingSpec)
    } catch (error) {
        log.error('Error while creating print job', error)
        return null
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
