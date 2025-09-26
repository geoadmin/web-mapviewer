import type { GeoAdminLayer, LayerAttribution } from '@swissgeo/layers'
import type Map from 'ol/Map'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { computed, ref } from 'vue'

import type { ActionDispatcher } from '@/store/types'

import {
    abortPrintJob,
    createPrintJob,
    PrintError,
    waitForPrintJobCompletion,
} from '@/api/print.api'
import { getGenerateQRCodeUrl } from '@/api/qrcode.api'
import { createShortLink } from '@/api/shortlink.api'
import { useI18nStore } from '@/store/modules/i18n.store'
import useLayersStore from '@/store/modules/layers.store'
import usePositionStore from '@/store/modules/position.store'
import usePrintStore from '@/store/modules/print.store'
import useUIStore from '@/store/modules/ui.store'
import { generateFilename } from '@/utils/utils'

const dispatcher: ActionDispatcher = { name: 'usePrint.composable' }

export enum PrintStatus {
    IDLE = 'IDLE',
    PRINTING = 'PRINTING',
    FINISHED_ABORTED = 'FINISHED_ABORTED',
    FINISHED_SUCCESSFULLY = 'FINISHED_SUCCESSFULLY',
    FINISHED_FAILED = 'FINISHED_FAILED',
}

/** Gathering of all the logic that will trigger and manage a print request to service-print3 */
export function usePrint(map: Map) {
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
     * @param printLegend Print all visible layer legend (if they have one) on the map, true or false
     */
    async function print(
        printGrid: boolean = false,
        printLegend: boolean = false
    ): Promise<string | undefined> {
        try {
            uiStore.setLoadingBarRequester(requester, dispatcher)
            if (currentJobReference.value) {
                await abortCurrentJob()
            }
            printStatus.value = PrintStatus.PRINTING
            const shortLink = await createShortLink(window.location.href)
            if (!shortLink) {
                log.error({
                    title: 'usePrint / print',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Emerald,
                    },
                    messages: ['failed to print because the short link request failed'],
                })
                return
            }
            const qrCodeUrl = getGenerateQRCodeUrl(shortLink)
            // using store values directly (instead of going through computed) so that it is a bit more performant
            // (we do not need to have reactivity on these values, if they change while printing we do nothing)
            const printJob = await createPrintJob(map, {
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
            const result = await waitForPrintJobCompletion(printJob)
            printStatus.value = PrintStatus.FINISHED_SUCCESSFULLY
            return result
        } catch (error) {
            log.error({
                title: 'usePrint.composable',
                titleStyle: {
                    backgroundColor: LogPreDefinedColor.Lime,
                },
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
                await abortPrintJob(currentJobReference.value)
                log.debug({
                    title: 'usePrint.composable',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Lime,
                    },
                    messages: ['Job', currentJobReference.value, 'successfully aborted'],
                })
                currentJobReference.value = undefined
                printStatus.value = PrintStatus.FINISHED_ABORTED
                uiStore.clearLoadingBarRequester(requester, dispatcher)
            }
        } catch (error) {
            log.error({
                title: 'usePrint.composable',
                titleStyle: {
                    backgroundColor: LogPreDefinedColor.Lime,
                },
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
