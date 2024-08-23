import { baseUrlOverrides, enforceEndingSlashInUrl } from '@/config/baseUrl.config'
import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'

export default function createBaseUrlOverrideParamConfig({ urlParamName, baseUrlPropertyName }) {
    function dispatchBaseUrlOverride(to, store, urlParamValue) {
        baseUrlOverrides[baseUrlPropertyName] = enforceEndingSlashInUrl(urlParamValue)
        store.dispatch('setHasBaseUrlOverrides', { hasBaseUrlOverrides: !!urlParamValue })
    }

    function extractValue() {
        return baseUrlOverrides[baseUrlPropertyName]
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
