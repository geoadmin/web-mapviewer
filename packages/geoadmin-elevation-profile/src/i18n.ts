import { createI18n } from 'vue-i18n'

import de from '@/locales/de.json'
import en from '@/locales/en.json'
import fr from '@/locales/fr.json'
import it from '@/locales/it.json'
import rm from '@/locales/rm.json'

type ElevationProfileMessageScheme = typeof en

const i18n = createI18n<[ElevationProfileMessageScheme], 'en' | 'de' | 'fr' | 'it' | 'rm'>({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages: { de, fr, it, en, rm },
})

export default i18n
