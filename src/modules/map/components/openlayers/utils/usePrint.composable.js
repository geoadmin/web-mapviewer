import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import { abortPrintJob, createPrintJob, waitForPrintJobCompletion } from '@/api/print.api.js'
import { getGenerateQRCodeUrl } from '@/api/qrcode.api.js'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'usePrint.composable' }

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
    const printLayout = computed(() => store.state.print.selectedLayout)
    const printScale = computed(() => store.state.print.selectedScale)
    const attributions = computed(() =>
        store.getters.visibleLayers
            .map((layer) => layer.attributions)
            .map((attribution) => attribution.name)
            .filter((attribution, index, self) => self.indexOf(attribution) === index)
    )
    const layersWithLegends = computed(() =>
        store.getters.visibleLayers.filter((layer) => layer.hasLegend)
    )
    const lang = computed(() => store.state.i18n.lang)
    const projection = computed(() => store.state.map.projection)

    /**
     * @param {Boolean} printGrid Print the coordinate grid on the finished PDF, true or false
     * @param {Boolean} printLegend Print all visible layer legend (if they have one) on the map,
     *   true or false
     * @returns {Promise<String | null>}
     */
    async function print(printGrid = false, printLegend = false) {
        try {
            if (currentJobReference.value) {
                await abortCurrentJob()
            }
            printStatus.value = PrintStatus.PRINTING
            await store.dispatch('generateShortLinks', dispatcher)
            const shortLink = store.state.share.shortLink
            const qrCodeUrl = getGenerateQRCodeUrl(shortLink)
            const printJob = await createPrintJob(map, {
                layout: printLayout.value,
                scale: printScale.value,
                attributions: attributions.value,
                qrCodeUrl,
                shortLink,
                layersWithLegends: printLegend ? layersWithLegends.value : [],
                lang: lang.value,
                printGrid: printGrid,
                projection: projection.value,
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
