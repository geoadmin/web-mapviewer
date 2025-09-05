import { PRINT_DEFAULT_DPI } from '@/config/print.config'
import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'

export function readPrintConfigFromUrlParam(urlParamValue) {
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

function dispatchPrintConfig(to, store, urlParamValue) {
    return store.dispatch('setPrintConfig', {
        config: readPrintConfigFromUrlParam(urlParamValue),
        dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
    })
}

function generatePrintConfigForUrl(store) {
    if (
        store.state.print.config.layout !== 'A4_L' ||
        store.state.print.config.dpi !== PRINT_DEFAULT_DPI
    ) {
        if (store.state.print.config.dpi === PRINT_DEFAULT_DPI) {
            return store.state.print.config.layout
        }
        return `${store.state.print.config.layout},${store.state.print.config.dpi}`
    }
    return null
}

/**
 * Describe the print config in the URL. Used by our headless print service to set up the viewer
 * before printing.
 */
export default class PrintConfigParamConfig extends AbstractParamConfig {
    constructor() {
        super({
            urlParamName: 'printConfig',
            mutationsToWatch: ['setPrintConfig'],
            setValuesInStore: dispatchPrintConfig,
            extractValueFromStore: generatePrintConfigForUrl,
            keepInUrlWhenDefault: false,
            valueType: String,
            defaultValue: null,
        })
    }
}
