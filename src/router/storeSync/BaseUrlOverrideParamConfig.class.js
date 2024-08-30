import {
    getBaseUrlOverride,
    hasBaseUrlOverrides,
    setBaseUrlOverrides,
} from '@/config/baseUrl.config'
import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'

export default function createBaseUrlOverrideParamConfig({ urlParamName, baseUrlPropertyName }) {
    function dispatchBaseUrlOverride(to, store, urlParamValue) {
        setBaseUrlOverrides(baseUrlPropertyName, urlParamValue)
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
