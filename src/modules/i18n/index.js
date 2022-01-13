import { createI18n } from 'vue-i18n'

import en from './locales/en.json'
import de from './locales/de.json'
import fr from './locales/fr.json'
import it from './locales/it.json'
import rm from './locales/rm.json'

export const languages = {
    en: en,
    de: de,
    fr: fr,
    it: it,
    rm: rm,
}

// detecting navigator's locale as the default language (if it is a language served by this app)
let matchingLang = null
if (navigator.languages) {
    navigator.languages.forEach((lang) => {
        // we keep the first match we found
        if (!matchingLang && lang in languages) {
            matchingLang = lang
        }
    })
}

const i18n = createI18n({
    locale: matchingLang ? matchingLang : 'en', // default locale
    messages: languages,
})

export default i18n
