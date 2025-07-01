import { defineStore } from 'pinia'

import i18n, {
    defaultLocal,
    isSupportedLang,
    langToLocale,
    type SupportedLang,
} from '@/modules/i18n'

export interface I18nState {
    /**
     * The current language used by this application, expressed as an country ISO code
     * (`en`,`de`,`fr,etc...)
     */
    lang: SupportedLang
}

function enforceStartupLangIsSupported(lang: string): SupportedLang {
    if (isSupportedLang(lang)) {
        return lang
    }
    return 'en'
}

export const useI18nStore = defineStore('i18n', {
    state: (): I18nState => ({
        lang: enforceStartupLangIsSupported(defaultLocal),
    }),
    getters: {},
    actions: {
        setLang(lang: SupportedLang) {
            this.lang = lang
            i18n.global.locale.value = langToLocale(lang)
        },
    },
})
