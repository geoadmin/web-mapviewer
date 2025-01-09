import { createI18n } from 'vue-i18n'

import log from '@/utils/logging'

import de from './locales/de.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import it from './locales/it.json'
import rm from './locales/rm.json'

export const languages = { de, fr, it, en, rm }

const OFFICIAL_SWISS_LANG = ['de', 'fr', 'it', 'rm']
export const SUPPORTED_LANG = ['en', ...OFFICIAL_SWISS_LANG]

const locales = Object.entries(languages).reduce((obj, entry) => {
    const key = langToLocal(entry[0])
    obj[key] = entry[1]
    return obj
}, {})

export function langToLocal(lang) {
    return OFFICIAL_SWISS_LANG.includes(lang) ? `${lang}-CH` : lang
}

// detecting navigator's locale as the default language
// (if it is a language served by this app)
const defaultLocal =
    navigator.languages
        ?.find((navigatorLang) => SUPPORTED_LANG.find((lang) => navigatorLang.startsWith(lang)))
        ?.split('-')[0] ?? SUPPORTED_LANG[0]
log.info(
    `Default local set to ${defaultLocal}, navigator languages`,
    navigator.languages,
    `supported language`,
    SUPPORTED_LANG
)

const datetimeFormats = Object.keys(locales).reduce((obj, key) => {
    obj[key] = {
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
}, {})

const i18n = createI18n({
    locale: defaultLocal,
    messages: languages,
    legacy: false,
    datetimeFormats,
})

export default i18n
