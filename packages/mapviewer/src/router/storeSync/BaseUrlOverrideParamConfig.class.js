import {
    getBaseUrlOverride,
    hasBaseUrlOverrides,
    setBaseUrlOverrides,
} from '@/config/baseUrl.config'
import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'
import { isValidUrl } from '@/utils/utils'

// //https://sys-{wms,wmts,api3}.{dev,int}.bgdi.ch/
// or http://localhost{:port_number}
const allowed_url_regexes = {
    wms_url: /^https:\/\/sys-wms.(dev|int).bgdi.ch\/?$/g,
    wmts_url: /^https:\/\/sys-wmts.(dev|int).bgdi.ch\/?$/g,
    api3: /^https:\/\/sys-api3.(dev|int).bgdi.ch\/?$/g,
    localhost: /^http:\/\/localhost(:\d{2,6})?\/?$/g,
}

export default function createBaseUrlOverrideParamConfig({ urlParamName, baseUrlPropertyName }) {
    function dispatchBaseUrlOverride(to, store, urlParamValue) {
        if (
            isValidUrl(urlParamValue) &&
            (allowed_url_regexes[urlParamName]?.match(urlParamValue) ||
                allowed_url_regexes.localhost.match(urlParamValue))
        ) {
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
