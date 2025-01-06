import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import { abortPrintJob, createPrintJob, waitForPrintJobCompletion } from '@/api/print.api.js'
import { getGenerateQRCodeUrl } from '@/api/qrcode.api.js'
import { createShortLink } from '@/api/shortlink.api.js'
import log from '@/utils/logging'

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
    /** @type {PrintError} */
    const printError = ref(null)

    const store = useStore()

    const hostname = computed(() => store.state.ui.hostname)

    async function printPup(server) {
        try {
            store.dispatch('setLoadingBarRequester', { requester, ...dispatcher })
            if (currentJobReference.value) {
                await abortCurrentJob()
            }
            printStatus.value = PrintStatus.PRINTING
            const searchParams = new URLSearchParams(location.hash.split('?')[1])
            const resolution = store.state.print.selectedScale / 25.4 / 96
            const w_3857 = 40075016.68557849
            const z = Math.log(w_3857 / 256 / resolution) / Math.log(2) + 1
            searchParams.set('z', z)
            searchParams.set('px', store.getters.selectedDPI / 96)
            searchParams.set('scale', store.state.print.selectedScale)
            const layoutParts = store.state.print.selectedLayout.name.split(' ')
            searchParams.set('pdf', `${layoutParts[1]}_${layoutParts[2][0].toUpperCase()}`)
            const printUrl = `${server}?${searchParams.toString()}`
            console.log(printUrl)
            currentJobReference.value = '111'
            const result = await fetch(printUrl)
            printStatus.value = PrintStatus.FINISHED_SUCCESSFULLY
            return URL.createObjectURL(await result.blob())
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
                    .concat([store.getters.currentBackgroundLayer])
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
                dpi: store.getters.selectedDPI,
            })
            currentJobReference.value = printJob.ref
            const result = await waitForPrintJobCompletion(printJob)
            printStatus.value = PrintStatus.FINISHED_SUCCESSFULLY
            return result
        } catch (error) {
            log.error('Error while printing', error)
            if (printStatus.value === PrintStatus.PRINTING) {
                printStatus.value = PrintStatus.FINISHED_FAILED
                printError.value = error
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
        printPup,
        abortCurrentJob,
        printStatus,
        printError,
    }
}
