import type { SupportedLang } from '@/modules/i18n'
import type useI18nStore from '@/store/modules/i18n'

export interface I18nStoreState {
    /**
     * The current language used by this application, expressed as an country ISO code
     * (`en`,`de`,`fr,etc...)
     */
    lang: SupportedLang
}

export type I18nStoreGetters = object

export type I18nStore = ReturnType<typeof useI18nStore>
