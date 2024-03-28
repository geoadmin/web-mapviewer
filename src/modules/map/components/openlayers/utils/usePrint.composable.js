import { ref } from 'vue'
import { useStore } from 'vuex'

import { abortPrintJob, createPrintJob, waitForPrintJobCompletion } from '@/api/print.api.js'
import { getGenerateQRCodeUrl } from '@/api/qrcode.api.js'
import { createShortLink } from '@/api/shortlink.api.js'
import log from '@/utils/logging'

// const dispatcher = { dispatcher: 'usePrint.composable' }

/** @enum */
export const PrintStatus = {
    IDLE: 'IDLE',
    PRINTING: 'PRINTING',
    FINISHED_SUCCESSFULLY: 'FINISHED_SUCCESSFULLY',
    FINISHED_FAILED: 'FINISHED_FAILED',
}

/**
 * Gathering of all the logic that will trigger and manage a print request to service-print3
 *
 * @param {Map} map
 */
export function usePrint(map) {
    const currentJobReference = ref(null)
    /** @type {PrintStatus} */
    const printStatus = ref(PrintStatus.IDLE)

    const store = useStore()

    /**
     * @param {Boolean} printGrid Print the coordinate grid on the finished PDF, true or false
     * @param {Boolean} printLegend Print all visible layer legend (if they have one) on the map,
     *   true or false
     * @returns {Promise<String | null>}
     */
    async function print(printGrid = false, printLegend = false) {
        try {
            // TODO PB-362 : show laoding bar
            if (currentJobReference.value) {
                await abortCurrentJob()
            }
            printStatus.value = PrintStatus.PRINTING
            const shortLink = await createShortLink(window.location.href)
            const qrCodeUrl = getGenerateQRCodeUrl(shortLink)
            // using store values directly (instead of going through computed) so that it is a bit more performant
            // (we do not need to have reactivity on these values, if they change while printing we do nothing)
            const printJob = await createPrintJob(map, {
                layout: store.state.print.selectedLayout,
                scale: store.state.print.selectedScale,
                attributions: store.getters.visibleLayers
                    .map((layer) => layer.attributions)
                    .map((attribution) => attribution.name)
                    .filter((attribution, index, self) => self.indexOf(attribution) === index),
                qrCodeUrl,
                shortLink,
                layersWithLegends: printLegend
                    ? store.getters.visibleLayers.filter((layer) => layer.hasLegend)
                    : [],
                lang: store.state.i18n.lang,
                printGrid: printGrid,
                projection: store.state.position.projection,
                excludedLayers: ['printAreaLayer'],
            })
            currentJobReference.value = printJob.ref
            const result = await waitForPrintJobCompletion(printJob)
            printStatus.value = PrintStatus.FINISHED_SUCCESSFULLY
            return result
        } catch (error) {
            log.error('Error while printing', error)
            printStatus.value = PrintStatus.FINISHED_FAILED
            return null
        } finally {
            // TODO PB-362 : hide laoding bar
            currentJobReference.value = null
        }
    }

    async function abortCurrentJob() {
        try {
            if (currentJobReference.value) {
                await abortPrintJob(currentJobReference.value)
                log.debug('Job', currentJobReference.value, 'successfully aborted')
                currentJobReference.value = null
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
