import Vue from 'vue'
import VueI18n from 'vue-i18n'

import en from './locales/en.json'
import de from './locales/de.json'
import fr from './locales/fr.json'
import it from './locales/it.json'
import rm from './locales/rm.json'

Vue.use(VueI18n)

export const languages = {
    en: en,
    de: de,
    fr: fr,
    it: it,
    rm: rm
}

const i18n = new VueI18n({
    locale: 'en', // default locale
    messages: languages
})

export default i18n;
