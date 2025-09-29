import type { PiniaPlugin } from 'pinia'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { START_LOCATION, useRouter } from 'vue-router'

import type { ActionDispatcher } from '@/store/types'

import useAppStore from '@/store/modules/app.store'
import { useI18nStore } from '@/store/modules/i18n.store'
import useLayersStore from '@/store/modules/layers.store'
import useTopicsStore from '@/store/modules/topics.store'
import useUIStore from '@/store/modules/ui.store'
import { isLegacyParams } from '@/utils/legacyLayerParamUtils'
import { readSingleParamAsString } from '@/utils/url-router'
import { isSupportedLang } from '@/modules/i18n'

const dispatcher: ActionDispatcher = { name: 'app-readiness.plugin' }

/**
 * Plugin that will listen to most actions as long as a certain state of readiness is not reached.
 * It then triggers a change of route, going to the map view, telling the app it can show the map
 * and all other associated UI elements.
 *
 * What is required for the app to be ready is :
 *
 * - Know the width and height of the viewport
 * - Have loaded the layers config
 * - Have loaded the topics config
 */
export const appReadinessPlugin: PiniaPlugin = (): void => {
    log.debug({
        title: '[App loading management plugin]',
        titleColor: LogPreDefinedColor.Yellow,
        messages: ['entry in app loading management plugin'],
    })

    const router = useRouter()
    const appStore = useAppStore()
    const i18nStore = useI18nStore()
    const layersStore = useLayersStore()
    const topicsStore = useTopicsStore()
    const uiStore = useUIStore()

    if (!appStore.isReady) {
        const isLegacyUrl = isLegacyParams(window?.location?.search)

        const unRegisterRouterHook = router.beforeEach((to, from) => {
            if (from === START_LOCATION && to.meta.requiresAppReady) {
                // Upon application startup we need to first get the language and
                // topic from the URL to quickly load the layers config and
                // topics. We do this as early as possible as we need topics and config to define
                // the default application state.
                const queryParams = to.query ?? {}
                const lang: string = readSingleParamAsString(queryParams, 'lang') ?? i18nStore.lang
                const topic: string =
                    readSingleParamAsString(queryParams, 'topic') ?? topicsStore.current

                log.info({
                    title: '[App loading management plugin]',
                    titleColor: LogPreDefinedColor.Yellow,
                    messages: [
                        `App is not ready dispatching lang=${lang} and topic=${topic} (isLegacy=${isLegacyUrl})`,
                        to,
                        from,
                    ],
                })

                topicsStore.changeTopic(topic, dispatcher)

                if (isSupportedLang(lang)) {
                    i18nStore.setLang(lang, dispatcher)
                } else {
                    log.error({
                        title: '[App loading management plugin]',
                        titleColor: LogPreDefinedColor.Yellow,
                        messages: [
                            `Invalid lang ${lang} in URL, defaulting to ${i18nStore.lang}`,
                            to,
                            from,
                        ],
                    })
                }
                unRegisterRouterHook()
            }
        })
    }

    const unsubscribe = appStore.$subscribe(() => {
        // TODO restrict the stores that we should subscribe to?

        // if the app is not ready yet, we go through the checklist
        if (!appStore.isReady) {
            if (
                uiStore.width > 0 &&
                uiStore.height > 0 &&
                layersStore.config.length > 0 &&
                topicsStore.config.length > 0
            ) {
                appStore.setAppIsReady(dispatcher)
            }
        } else {
            log.info({
                title: '[App loading management plugin]',
                titleColor: LogPreDefinedColor.Yellow,
                messages: ['App is ready, unregister app loading management plugin'],
            })
            unsubscribe()
        }
    })
}

export default appReadinessPlugin
