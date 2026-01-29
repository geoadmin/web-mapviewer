import type {
    MFPSymbolizerLine,
    MFPSymbolizerPoint,
    MFPSymbolizerText,
} from '@geoblocks/mapfishprint'
import type { GeoAdminLayer, LayerAttribution } from '@swissgeo/layers'
import type { GeoJSONFeature } from 'ol/format/GeoJSON'
import type { State } from 'ol/layer/Layer'
import type Map from 'ol/Map'
import type { Size } from 'ol/size'
import type { Circle, Image, Stroke, Text } from 'ol/style'
import type { Raw } from 'vue'

import { BaseCustomizer, MFPEncoder } from '@geoblocks/mapfishprint'
import { fileProxyAPI, qrcodeAPI, shortLinkAPI } from '@swissgeo/api'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { getViewerDedicatedServicesBaseUrl } from '@swissgeo/staging-config'
import { MIN_PRINT_SCALE_SIZE, PRINT_DPI_COMPENSATION } from '@swissgeo/staging-config/constants'
import { computed, ref } from 'vue'

import type { ActionDispatcher } from '@/store/types'

import { ENVIRONMENT } from '@/config'
import useI18nStore from '@/store/modules/i18n'
import useLayersStore from '@/store/modules/layers'
import usePositionStore from '@/store/modules/position'
import usePrintStore from '@/store/modules/print'
import useUIStore from '@/store/modules/ui'
import { PrintError, printAPI } from '@/utils/print/print.api'
import { generateFilename } from '@/utils/utils'

const dispatcher: ActionDispatcher = { name: 'usePrint.composable' }

export enum PrintStatus {
    IDLE = 'IDLE',
    PRINTING = 'PRINTING',
    FINISHED_ABORTED = 'FINISHED_ABORTED',
    FINISHED_SUCCESSFULLY = 'FINISHED_SUCCESSFULLY',
    FINISHED_FAILED = 'FINISHED_FAILED',
}

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
    readonly printResolution: number

    /**
     * Constructor(layerIDsToExclude, printResolution) {
     *
     * @param printExtent - The extent of the area to be printed. super()
     * @param printResolution - The resolution for the print.
     */
    constructor(printExtent: number[], printResolution: number) {
        super(printExtent)
        this.printResolution = printResolution
        this.layerFilter = this.layerFilter.bind(this)
        this.geometryFilter = this.geometryFilter.bind(this)
        this.line = this.line.bind(this)
        this.text = this.text.bind(this)
        this.point = this.point.bind(this)
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
                title: 'GeoAdminCustomizer / text',
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
    ): void {
        log.debug({
            title: 'GeoAdminCustomizer / point',
            messages: ['Symbolizer for marker', symbolizer],
        })
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
        } else if ('getRadius' in image) {
            const radius = (image as Circle).getRadius()
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

/** Gathering of all the logic that will trigger and manage a print request to service-print3 */
export function usePrint(map: Raw<Map>) {
    const requester = 'print-map'

    const currentJobReference = ref<string | undefined>()
    const printStatus = ref<PrintStatus>(PrintStatus.IDLE)
    const printError = ref<PrintError>()

    const layerStore = useLayersStore()
    const i18nStore = useI18nStore()
    const positionStore = usePositionStore()
    const printStore = usePrintStore()
    const uiStore = useUIStore()

    const layerAttributions = computed<string[]>(() => {
        const layers: LayerAttribution[] = []
        if (layerStore.currentBackgroundLayer) {
            layers.push(layerStore.currentBackgroundLayer)
        }
        if (layerStore.visibleLayers.length > 0) {
            layers.push(...layerStore.visibleLayers)
        }
        return layers
            .filter((layer) => 'attributions' in layer && Array.isArray(layer.attributions))
            .map((layer) => (layer as GeoAdminLayer).attributions)
            .flat()
            .map((attribution) => attribution.name)
            .filter((attribution, index, self) => self.indexOf(attribution) === index)
    })

    /**
     * @param printGrid Print the coordinate grid on the finished PDF, true or false
     * @param printLegend Print all visible layer legend (if they have one) on the map, true or
     *   false
     */
    async function print(
        printGrid: boolean = false,
        printLegend: boolean = false
    ): Promise<string | undefined> {
        let shortLink: string
        try {
            shortLink =
                (await shortLinkAPI.createShortLink({
                    url: window.location.href,
                    staging: ENVIRONMENT,
                })) ?? window.location.href
        } catch (error) {
            log.error({
                title: 'usePrint / print',
                titleColor: LogPreDefinedColor.Emerald,
                messages: ['failed to get a shortLink for the print, fallback to full URL', error],
            })
            shortLink = window.location.href
        }

        try {
            uiStore.setLoadingBarRequester(requester, dispatcher)
            if (currentJobReference.value) {
                await abortCurrentJob()
            }
            printStatus.value = PrintStatus.PRINTING

            const qrCodeUrl = qrcodeAPI.getGenerateQRCodeUrl(shortLink, ENVIRONMENT)

            if (!printStore.selectedScale) {
                throw new PrintError('Missing scale')
            }
            if (!printStore.selectedDPI) {
                throw new PrintError('Missing DPI for printing')
            }
            if (!printStore.printExtent) {
                throw new PrintError('Missing print extent')
            }
            // Tool to transform an OpenLayers map into a "spec" for MapFishPrint3 (meaning a big JSON)
            // that can then be used as a request body for printing.
            const encoder = new MFPEncoder(
                `${getViewerDedicatedServicesBaseUrl(ENVIRONMENT)}print3/print/mapviewer`
            )

            const encodedMap = await encoder.encodeMap({
                map,
                scale: printStore.selectedScale,
                printResolution: map.getView().getResolution() ?? 0,
                dpi: printStore.selectedDPI,
                customizer: new GeoAdminCustomizer(printStore.printExtent, printStore.selectedDPI),
            })
            log.debug({
                title: 'transformOlMapToPrintParams',
                messages: ['Encoded map', encodedMap],
            })

            // using store values directly (instead of going through computed) so that it is a bit more performant
            // (we do not need to have reactivity on these values, if they change while printing we do nothing)
            const printJob = await printAPI.createPrintJob(encodedMap, {
                // .pdf extension will be written by MapFish too, so we remove it to not have it twice in a row
                outputFilename: generateFilename('pdf').replace('.pdf', ''),
                layout: printStore.selectedLayout,
                scale: printStore.selectedScale,
                attributions: layerAttributions.value,
                qrCodeUrl,
                shortLink,
                layersWithLegends: printLegend
                    ? layerStore.visibleLayers
                          .filter((layer) => layer.hasLegend)
                          // remove duplicate layers for the legends to avoid duplicate legends
                          .filter(
                              (layer, index, self) =>
                                  self.findIndex((l) => l.id === layer.id) === index
                          )
                    : [],
                lang: i18nStore.lang,
                printGrid: printGrid,
                printExtent: printStore.printExtent,
                projection: positionStore.projection,
                dpi: printStore.selectedDPI,
            })
            currentJobReference.value = printJob.ref
            const result = await printAPI.waitForPrintJobCompletion(printJob)
            printStatus.value = PrintStatus.FINISHED_SUCCESSFULLY
            return result
        } catch (error) {
            log.error({
                title: 'usePrint.composable',
                titleColor: LogPreDefinedColor.Emerald,
                messages: ['Error while printing', error],
            })
            if (printStatus.value === PrintStatus.PRINTING) {
                printStatus.value = PrintStatus.FINISHED_FAILED
                if (error instanceof PrintError) {
                    printError.value = error
                }
            }
            return
        } finally {
            uiStore.clearLoadingBarRequester(requester, dispatcher)
            currentJobReference.value = undefined
        }
    }

    async function abortCurrentJob() {
        try {
            if (currentJobReference.value) {
                await printAPI.abortPrintJob(currentJobReference.value)
                log.debug({
                    title: 'usePrint.composable',
                    titleColor: LogPreDefinedColor.Emerald,
                    messages: ['Job', currentJobReference.value, 'successfully aborted'],
                })
                currentJobReference.value = undefined
                printStatus.value = PrintStatus.FINISHED_ABORTED
                uiStore.clearLoadingBarRequester(requester, dispatcher)
            }
        } catch (error) {
            log.error({
                title: 'usePrint.composable',
                titleColor: LogPreDefinedColor.Emerald,
                messages: ['Error while aborting job', currentJobReference.value, error],
            })
        }
    }

    return {
        print,
        abortCurrentJob,
        printStatus,
        printError,
    }
}
