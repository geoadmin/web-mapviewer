import type { RouteLocationNormalizedGeneric } from 'vue-router'

import {
    getBaseUrlOverride,
    hasBaseUrlOverrides,
    setBaseUrlOverrides,
} from '@/config/baseUrl.config.ts'
import UrlParamConfig from '@/router/storeSync/UrlParamConfig.class'
import useDebugStore from '@/store/modules/debug.store'
import { isValidUrl } from '@/utils/utils.ts'

export default function createBaseUrlOverrideParamConfig({
    urlParamName,
    baseUrlPropertyName,
}: {
    urlParamName: string
    baseUrlPropertyName: string
}): UrlParamConfig<string, string> {
    function dispatchBaseUrlOverride(_: RouteLocationNormalizedGeneric, urlParamValue?: string) {
        if (isValidUrl(urlParamValue)) {
            setBaseUrlOverrides(baseUrlPropertyName, urlParamValue)
        } else {
            setBaseUrlOverrides(baseUrlPropertyName, undefined)
        }
        const hasNowOverrides = hasBaseUrlOverrides()
        const debugStore = useDebugStore()
        if (debugStore.hasBaseUrlOverrides !== hasNowOverrides) {
            debugStore.setHasBaseUrlOverrides(hasNowOverrides, {
                name: `BaseUrlOverrideParamConfig.${urlParamName}`,
            })
        }
    }

    function extractValue() {
        return getBaseUrlOverride(baseUrlPropertyName)
    }

    return new UrlParamConfig<string, string>({
        urlParamName,
        mutationsToWatch: ['setHasBaseUrlOverrides'],
        setValuesInStore: dispatchBaseUrlOverride,
        extractValueFromStore: extractValue,
        keepInUrlWhenDefault: false,
        valueType: String,
        defaultValue: undefined,
    })
}
