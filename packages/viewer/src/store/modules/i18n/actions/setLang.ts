import type { I18nStore } from '@/store/modules/i18n/types'
import type { ActionDispatcher } from '@/store/types'

import i18n, { langToLocale, type SupportedLang } from '@/modules/i18n'
import useLayersStore from '@/store/modules/layers'
import redoSearch from '@/store/modules/search/utils/redoSearch'

interface SetLangOptions {
    changeLayersOnTopicChange?: boolean
}

export default function setLang(
    this: I18nStore,
    lang: SupportedLang,
    dispatcher: ActionDispatcher
): void
export default function setLang(
    this: I18nStore,
    lang: SupportedLang,
    optionsOrDispatcher: SetLangOptions | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
): void {
    const dispatcher = dispatcherOrNothing ?? (optionsOrDispatcher as ActionDispatcher)
    const options = dispatcherOrNothing ? (optionsOrDispatcher as SetLangOptions) : {}
    this.lang = lang
    i18n.global.locale.value = langToLocale(lang)
    useLayersStore().loadLayersConfig(
        { changeLayersOnTopicChange: options.changeLayersOnTopicChange },
        dispatcher
    )
    redoSearch()
}
