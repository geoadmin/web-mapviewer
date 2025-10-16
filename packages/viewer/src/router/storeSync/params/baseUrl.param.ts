import type { BackendServices } from '@swissgeo/staging-config'
import type { RouteLocationNormalizedGeneric } from 'vue-router'

import {
    getBaseUrlOverride,
    hasBaseUrlOverrides,
    setBaseUrlOverrides,
} from '@/config/baseUrl.config'
import UrlParamConfig from '@/router/storeSync/UrlParamConfig.class'
import useDebugStore, { DebugStoreActions } from '@/store/modules/debug.store'
import { isValidUrl } from '@/utils/utils'

export default function createBaseUrlOverrideParamConfig({
    urlParamName,
    baseUrlPropertyName,
}: {
    urlParamName: string
    baseUrlPropertyName: BackendServices
}): UrlParamConfig<string> {
    return new UrlParamConfig<string>({
        urlParamName,
        actionsToWatch: [DebugStoreActions.SetHasBaseUrlOverrides],
        setValuesInStore: (_: RouteLocationNormalizedGeneric, urlParamValue?: string) => {
            if (urlParamValue && isValidUrl(urlParamValue)) {
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
        },
        extractValueFromStore: () => getBaseUrlOverride(baseUrlPropertyName),
        keepInUrlWhenDefault: false,
        valueType: String,
    })
}
