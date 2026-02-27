import type { I18nOptions, IntlDateTimeFormat } from 'vue-i18n'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { createI18n } from 'vue-i18n'

import cesiumDe from '@/modules/map/components/cesium/locales/de.json'
import cesiumEn from '@/modules/map/components/cesium/locales/en.json'
import cesiumFr from '@/modules/map/components/cesium/locales/fr.json'
import cesiumIt from '@/modules/map/components/cesium/locales/it.json'
import cesiumRm from '@/modules/map/components/cesium/locales/rm.json'

import de from './locales/de.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import it from './locales/it.json'
import rm from './locales/rm.json'

type CesiumMessageScheme = typeof cesiumDe
type MessageScheme = typeof de & CesiumMessageScheme

export type SupportedLang = 'en' | 'de' | 'fr' | 'it' | 'rm'

export const languages: { [key in SupportedLang]: MessageScheme } = {
    de: { ...de, ...cesiumDe },
    fr: { ...fr, ...cesiumFr },
    it: { ...it, ...cesiumIt },
    en: { ...en, ...cesiumEn },
    rm: { ...rm, ...cesiumRm },
}

const OFFICIAL_SWISS_LANG: string[] = ['de', 'fr', 'it', 'rm']
export const SUPPORTED_LANG: string[] = ['en', ...OFFICIAL_SWISS_LANG]

const locales: string[] = [...SUPPORTED_LANG, ...SUPPORTED_LANG.map((lang) => langToLocale(lang))]

export function langToLocale(lang: string): string {
    return OFFICIAL_SWISS_LANG.includes(lang) ? `${lang}-CH` : lang
}

export function isSupportedLang(lang?: string): lang is SupportedLang {
    if (!lang) {
        return false
    }
    return SUPPORTED_LANG.includes(lang)
}

// detecting navigator's locale as the default language
// (if it is a language served by this app)
export const defaultLocal: string =
    navigator.languages
        .map((navigatorLang) => {
            // lang in the navigator can be expressed as any form of
            if (navigatorLang.indexOf('-')) {
                return navigatorLang.split('-')[0]
            }
            return navigatorLang
        })
        .find((navigatorLang) => isSupportedLang(navigatorLang))
        ?.split('-')[0] ?? SUPPORTED_LANG[0]

log.info({
    title: 'I18n setup',
    titleStyle: {
        backgroundColor: LogPreDefinedColor.Fuchsia,
    },
    messages: [
        `Default local set to ${defaultLocal}, navigator languages`,
        navigator.languages,
        `supported language`,
        SUPPORTED_LANG,
    ],
})

const datetimeFormats = locales.reduce(
    (obj: { [key: string]: IntlDateTimeFormat }, locale: string) => {
        obj[locale] = {
            date: { year: 'numeric', month: 'numeric', day: 'numeric' },
            datetime: {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            },
        }
        return obj
    },
    {}
)

const options: I18nOptions = {
    legacy: false,
    locale: defaultLocal,
    messages: languages,
    datetimeFormats,
    // no error if missing translation, just display the input untranslated.
    missingWarn: false,
    fallbackWarn: false,
}

const i18n = createI18n<false, typeof options>(options)

export default i18n
