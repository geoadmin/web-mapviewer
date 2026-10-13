import {
    getBaseUrlOverride,
    hasBaseUrlOverrides,
    setBaseUrlOverrides,
} from '@/config/baseUrl.config'
import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'
import { isValidUrl } from '@/utils/utils'

// https://sys-{wms,wmts,api3}.{dev,int}.bgdi.ch/ or http://localhost{:port_number}
const ALLOWED_BGDI_URL = /^https:\/\/sys-(wms|wmts|api3)\.(dev|int)\.bgdi\.ch(\/[^?]*)?(\?.*)?$/
const ALLOWED_LOCALHOST_URL = /^http:\/\/localhost(:\d{2,6})?(\/[^?]*)?(\?.*)?$/

/**
 * To protect against XSS attacks, we only allow the override of the base URL if the URL is
 * whitelisted.
 */
export function isBaseUrlOverrideAllowed(url) {
    return ALLOWED_BGDI_URL.test(url) || ALLOWED_LOCALHOST_URL.test(url)
}

export default function createBaseUrlOverrideParamConfig({ urlParamName, baseUrlPropertyName }) {
    function dispatchBaseUrlOverride(to, store, urlParamValue) {
        if (isValidUrl(urlParamValue) && isBaseUrlOverrideAllowed(urlParamValue)) {
            setBaseUrlOverrides(baseUrlPropertyName, urlParamValue)
        } else {
            setBaseUrlOverrides(baseUrlPropertyName, null)
        }
        const hasNowOverrides = hasBaseUrlOverrides()
        if (store.state.debug.hasBaseUrlOverride !== hasNowOverrides) {
            store.dispatch('setHasBaseUrlOverrides', {
                hasOverrides: hasNowOverrides,
                dispatcher: `BaseUrlOverrideParamConfig.${urlParamName}`,
            })
        }
    }

    function extractValue() {
        return getBaseUrlOverride(baseUrlPropertyName)
    }

    return new (class BaseUrlOverrideParamConfig extends AbstractParamConfig {
        constructor() {
            super({
                urlParamName,
                mutationsToWatch: ['setHasBaseUrlOverrides'],
                setValuesInStore: dispatchBaseUrlOverride,
                extractValueFromStore: extractValue,
                keepInUrlWhenDefault: false,
                valueType: String,
                defaultValue: null,
            })
        }
    })()
}
