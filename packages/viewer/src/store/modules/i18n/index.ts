import { defineStore } from 'pinia'

import type { I18nStoreGetters, I18nStoreState } from '@/store/modules/i18n/types'

import { defaultLocal, isSupportedLang, type SupportedLang } from '@/modules/i18n'
import setLang from '@/store/modules/i18n/actions/setLang'

function enforceStartupLangIsSupported(lang: string): SupportedLang {
    if (isSupportedLang(lang)) {
        return lang
    }
    return 'en'
}

const state = (): I18nStoreState => ({
    lang: enforceStartupLangIsSupported(defaultLocal),
})

const getters: I18nStoreGetters = {}

const actions = {
    setLang,
}

const useI18nStore = defineStore('i18n', {
    state,
    getters: { ...getters },
    actions,
})

export default useI18nStore
