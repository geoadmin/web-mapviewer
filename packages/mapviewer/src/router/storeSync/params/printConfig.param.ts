import type { RouteLocationNormalizedGeneric } from 'vue-router'

import { PRINT_DEFAULT_DPI } from '@/config/print.config'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import { type NewPrintServiceConfig, usePrintStore } from '@/store/modules/print.store'

export function readPrintConfigFromUrlParam(urlParamValue?: string): NewPrintServiceConfig {
    if (urlParamValue) {
        const params = urlParamValue.split(',')
        if (params.length === 2) {
            return {
                layout: params[0],
                dpi: parseInt(params[1]),
            }
        } else if (params.length === 1) {
            return {
                layout: params[0],
                dpi: PRINT_DEFAULT_DPI,
            }
        }
    }
    return {
        layout: 'A4_L',
        dpi: PRINT_DEFAULT_DPI,
    }
}

function dispatchPrintConfig(_: RouteLocationNormalizedGeneric, urlParamValue?: string): void {
    const printStore = usePrintStore()
    printStore.setPrintConfig(
        readPrintConfigFromUrlParam(urlParamValue),
        STORE_DISPATCHER_ROUTER_PLUGIN
    )
}

function generatePrintConfigForUrl(): string | undefined {
    const printStore = usePrintStore()
    if (printStore.config.layout !== 'A4_L' || printStore.config.dpi !== PRINT_DEFAULT_DPI) {
        if (printStore.config.dpi === PRINT_DEFAULT_DPI) {
            return printStore.config.layout
        }
        return `${printStore.config.layout},${printStore.config.dpi}`
    }
    return
}

/**
 * Describe the print config in the URL. Used by our headless print service to set up the viewer
 * before printing.
 */
const printParamConfig = new UrlParamConfig<NewPrintServiceConfig, string>({
    urlParamName: 'printConfig',
    mutationsToWatch: ['setPrintConfig'],
    setValuesInStore: dispatchPrintConfig,
    extractValueFromStore: generatePrintConfigForUrl,
    keepInUrlWhenDefault: false,
    valueType: String,
    defaultValue: undefined,
})
export default printParamConfig
