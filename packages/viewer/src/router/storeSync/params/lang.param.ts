import type { RouteLocationNormalizedGeneric } from 'vue-router'

import { SUPPORTED_LANG, type SupportedLang } from '@/modules/i18n'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import { getDefaultValidationResponse } from '@/router/storeSync/validation'
import { I18nStoreActions } from '@/store/actions'
import useI18nStore from '@/store/modules/i18n.store'

function parseLang(urlParamValue?: string): SupportedLang | undefined {
    if (!urlParamValue) {
        return undefined
    }
    if (SUPPORTED_LANG.includes(urlParamValue.toLowerCase())) {
        return urlParamValue.toLowerCase() as SupportedLang
    }
    return undefined
}

const langParamConfig = new UrlParamConfig<string>({
    urlParamName: 'lang',
    actionsToWatch: [I18nStoreActions.SetLang],
    extractValueFromStore: () => useI18nStore().lang,
    setValuesInStore: (_: RouteLocationNormalizedGeneric, urlParamValue?: string) => {
        const parsedLang = parseLang(urlParamValue)
        if (!parsedLang) {
            return
        }
        useI18nStore().setLang(parsedLang, STORE_DISPATCHER_ROUTER_PLUGIN)
    },
    keepInUrlWhenDefault: true,
    valueType: String,
    validateUrlInput: (queryValue?: string) =>
        getDefaultValidationResponse(queryValue, parseLang(queryValue) !== undefined, 'lang'),
})

export default langParamConfig
