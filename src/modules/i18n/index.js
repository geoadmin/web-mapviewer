import { createI18n } from 'vue-i18n'

import de from './locales/de.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import it from './locales/it.json'
import rm from './locales/rm.json'

export const languages = { de, fr, it, en, rm }

const locales = Object.entries(languages).reduce((obj, entry) => {
    const key = langToLocal(entry[0])
    obj[key] = entry[1]
    return obj
}, {})

export function langToLocal(lang) {
    return ['de', 'fr', 'it', 'rm'].includes(lang) ? `${lang}-CH` : lang
}

// detecting navigator's locale as the default language
// (if it is a language served by this app)
let matchedLanguage = null
if (navigator.languages) {
    // we keep the first match we found
    matchedLanguage = navigator.languages.find((lang) => Object.keys(locales).includes(lang))
}

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
    locale: matchedLanguage || 'en', // default locale
    messages: languages,
    legacy: false,
    datetimeFormats,
})

export default i18n
