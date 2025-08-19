import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/types.ts'

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

function enforceLangIsSupported(lang: string): SupportedLang {
    if (isSupportedLang(lang)) {
        return lang
    }
    return 'en'
}

export const useI18nStore = defineStore('i18n', {
    state: (): I18nState => ({
        lang: enforceLangIsSupported(defaultLocal),
    }),
    getters: {},
    actions: {
        setLang(lang: string, dispatcher: ActionDispatcher) {
            const langToSet = enforceLangIsSupported(lang)
            this.lang = langToSet
            i18n.global.locale.value = langToLocale(langToSet)
        },
    },
})
