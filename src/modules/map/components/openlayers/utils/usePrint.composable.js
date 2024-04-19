import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import { abortPrintJob, createPrintJob, waitForPrintJobCompletion } from '@/api/print.api.js'
import { getGenerateQRCodeUrl } from '@/api/qrcode.api.js'
import { createShortLink } from '@/api/shortlink.api.js'
import log from '@/utils/logging'

import { PRINT_AREA_LAYER_ID } from './printConstants'

const dispatcher = { dispatcher: 'usePrint.composable' }

/** @enum */
export const PrintStatus = {
    IDLE: 'IDLE',
    PRINTING: 'PRINTING',
    FINISHED_ABORTED: 'FINISHED_ABORTED',
    FINISHED_SUCCESSFULLY: 'FINISHED_SUCCESSFULLY',
    FINISHED_FAILED: 'FINISHED_FAILED',
}

/**
 * Gathering of all the logic that will trigger and manage a print request to service-print3
 *
 * @param {Map} map
 */
export function usePrint(map) {
    const requester = 'print-map'

    const currentJobReference = ref(null)
    /** @type {PrintStatus} */
    const printStatus = ref(PrintStatus.IDLE)

    const store = useStore()

    const hostname = computed(() => store.state.ui.hostname)

    /**
     * @param {Boolean} printGrid Print the coordinate grid on the finished PDF, true or false
     * @param {Boolean} printLegend Print all visible layer legend (if they have one) on the map,
     *   true or false
     * @returns {Promise<String | null>}
     */
    async function print(printGrid = false, printLegend = false) {
        try {
            store.dispatch('setLoadingBarRequester', { requester, ...dispatcher })
            if (currentJobReference.value) {
                await abortCurrentJob()
            }
            printStatus.value = PrintStatus.PRINTING
            const shortLink = await createShortLink(window.location.href)
            const qrCodeUrl = getGenerateQRCodeUrl(shortLink)
            // using store values directly (instead of going through computed) so that it is a bit more performant
            // (we do not need to have reactivity on these values, if they change while printing we do nothing)
            const printJob = await createPrintJob(map, {
                // NOTE: below we use the '-' instead of ':' for hours, minutes and seconds separator
                // because chrome and firefox will anyway replace the ':' characters to either space
                // or '_'. The ${yyyy-MM-dd'T'HH-mm-ss'Z'} placeholder is used by mapfish print see
                // https://mapfish.github.io/mapfish-print-doc/configuration.html
                outputFilename: `${hostname.value}_\${yyyy-MM-dd'T'HH-mm-ss'Z'}`,
                layout: store.state.print.selectedLayout,
                scale: store.state.print.selectedScale,
                attributions: store.getters.visibleLayers
                    .concat([store.state.layers.currentBackgroundLayer])
                    .filter((layer) => !!layer)
                    .map((layer) => layer.attributions)
                    .flat()
                    .map((attribution) => attribution.name)
                    .filter((attribution, index, self) => self.indexOf(attribution) === index),
                qrCodeUrl,
                shortLink,
                layersWithLegends: printLegend
                    ? store.getters.visibleLayers
                          .filter((layer) => layer.hasLegend)
                          // remove duplicate layers for the legends to avoid duplicate legends
                          .filter(
                              (layer, index, self) =>
                                  self.findIndex((l) => l.id === layer.id) === index
                          )
                    : [],
                lang: store.state.i18n.lang,
                printGrid: printGrid,
                projection: store.state.position.projection,
                excludedLayerIDs: [PRINT_AREA_LAYER_ID],
            })
            currentJobReference.value = printJob.ref
            const result = await waitForPrintJobCompletion(printJob)
            printStatus.value = PrintStatus.FINISHED_SUCCESSFULLY
            return result
        } catch (error) {
            log.error('Error while printing', error)
            if (printStatus.value === PrintStatus.PRINTING) {
                printStatus.value = PrintStatus.FINISHED_FAILED
            }
            return null
        } finally {
            store.dispatch('clearLoadingBarRequester', { requester, ...dispatcher })
            currentJobReference.value = null
        }
    }

    async function abortCurrentJob() {
        try {
            if (currentJobReference.value) {
                await abortPrintJob(currentJobReference.value)
                log.debug('Job', currentJobReference.value, 'successfully aborted')
                currentJobReference.value = null
                printStatus.value = PrintStatus.FINISHED_ABORTED
                store.dispatch('clearLoadingBarRequester', { requester, ...dispatcher })
            }
        } catch (error) {
            log.error('Could not abort job', currentJobReference.value, error)
        }
    }

    return {
        print,
        abortCurrentJob,
        printStatus,
    }
}
