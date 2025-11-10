import type { I18nStore } from '@/store/modules/i18n/types/i18n'
import type { ActionDispatcher } from '@/store/types'

import i18n, { langToLocale, type SupportedLang } from '@/modules/i18n'
import useLayersStore from '@/store/modules/layers'
import redoSearch from '@/store/modules/search/utils/redoSearch'

export default function setLang(
    this: I18nStore,
    lang: SupportedLang,
    dispatcher: ActionDispatcher
) {
    this.lang = lang
    i18n.global.locale.value = langToLocale(lang)
    useLayersStore().loadLayersConfig({ changeLayersOnTopicChange: true }, dispatcher)
    redoSearch()
}
