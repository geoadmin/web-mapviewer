import { createI18n } from 'vue-i18n'

import de from './locales/de.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import it from './locales/it.json'
import rm from './locales/rm.json'

export const languages = { de, fr, it, en, rm }

// detecting navigator's locale as the default language
// (if it is a language served by this app)
let matchedLanguage = null
if (navigator.languages) {
    // we keep the first match we found
    matchedLanguage = navigator.languages.find((lang) => lang in languages)
}

const i18n = createI18n({
    locale: matchedLanguage || 'en', // default locale
    messages: languages,
    legacy: false,
})

export default i18n
