import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

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

export enum I18nStoreActions {
    SetLang = 'setLang',
}

function enforceStartupLangIsSupported(lang: string): SupportedLang {
    if (isSupportedLang(lang)) {
        return lang
    }
    return 'en'
}

const useI18nStore = defineStore('i18n', {
    state: (): I18nState => ({
        lang: enforceStartupLangIsSupported(defaultLocal),
    }),
    getters: {},
    actions: {
        [I18nStoreActions.SetLang](lang: SupportedLang, dispatcher: ActionDispatcher) {
            this.lang = lang
            i18n.global.locale.value = langToLocale(lang)
        },
    },
})

export default useI18nStore
