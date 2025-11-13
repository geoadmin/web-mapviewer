import log, { LogPreDefinedColor } from '@swissgeo/log'
import { START_LOCATION } from 'vue-router'

import type { RouterPlugin } from '@/router/types'
import type { ActionDispatcher } from '@/store/types'

import { isSupportedLang } from '@/modules/i18n'
import { MAP_VIEW } from '@/router/viewNames'
import useAppStore from '@/store/modules/app'
import { AppStateNames } from '@/store/modules/app/types/appState'
import useI18nStore from '@/store/modules/i18n'
import useLayersStore from '@/store/modules/layers'
import useTopicsStore from '@/store/modules/topics'
import useUIStore from '@/store/modules/ui'
import { isLegacyParams } from '@/utils/legacyLayerParamUtils'
import { readSingleParamAsString } from '@/utils/url-router'

const dispatcher: ActionDispatcher = { name: 'appReadiness.routerPlugin' }

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
export const appReadinessRouterPlugin: RouterPlugin = (router): void => {
    const unsubscribes: (() => void)[] = []

    const unRegisterRouterHook = router.beforeEach((to, from) => {
        let startingTopic: string | undefined
        const isLegacyUrl = isLegacyParams(window?.location?.search)

        const appStore = useAppStore()
        const i18nStore = useI18nStore()
        const layersStore = useLayersStore()
        const topicsStore = useTopicsStore()
        const uiStore = useUIStore()

        function handleAppReady() {
            if (appStore.isLoadingConfig && appStore.appState.isFulfilled()) {
                log.info({
                    title: 'App loading management plugin',
                    titleColor: LogPreDefinedColor.Yellow,
                    messages: [`App is ready`],
                })
                unsubscribes.forEach((unsubscribe) => unsubscribe())
                unRegisterRouterHook()

                router
                    .push({ name: MAP_VIEW, query: to.query })
                    .then(() => {
                        appStore.nextState(dispatcher)
                    })
                    .catch((error) => {
                        log.error({
                            title: 'App loading management plugin',
                            titleColor: LogPreDefinedColor.Yellow,
                            messages: [`Error while routing to map view`, error],
                        })
                    })
            }
        }

        if (START_LOCATION && to.meta.requiresAppReady) {
            if (appStore.isLoadingConfig && appStore.appState.isFulfilled()) {
                log.info({
                    title: 'App loading management plugin',
                    titleColor: LogPreDefinedColor.Yellow,
                    messages: [`App is not ready, waiting...`],
                })
                unsubscribes.push(layersStore.$subscribe(handleAppReady))
                unsubscribes.push(topicsStore.$subscribe(handleAppReady))
                unsubscribes.push(uiStore.$subscribe(handleAppReady))

                // Upon application startup we need to first get the language and
                // topic from the URL to quickly load the layers config and
                // topics. We do this as early as possible as we need topics and config to define
                // the default application state.
                const queryParams = to.query ?? {}
                const lang: string = readSingleParamAsString(queryParams, 'lang') ?? i18nStore.lang
                const topic = readSingleParamAsString(queryParams, 'topic')
                if (topic) {
                    startingTopic = topic
                    const appStore = useAppStore()
                    if (appStore.isConfigLoaded) {
                        topicsStore.changeTopic(topic, dispatcher)
                    } else {
                        appStore.$onAction(({ after, name }) => {
                            const nextState = appStore.appState.next()
                            if (
                                name === 'nextState' &&
                                nextState.name === AppStateNames.ConfigLoaded
                            ) {
                                after(() => {
                                    if (startingTopic) {
                                        topicsStore.changeTopic(startingTopic, dispatcher)
                                    }
                                })
                            }
                        })
                    }
                }
                log.info({
                    title: 'App loading management plugin',
                    titleColor: LogPreDefinedColor.Yellow,
                    messages: [
                        `App is not ready dispatching lang=${lang} and topic=${topic} (isLegacy=${isLegacyUrl})`,
                        to,
                        from,
                    ],
                })

                if (isSupportedLang(lang)) {
                    if (i18nStore.lang !== lang) {
                        i18nStore.setLang(lang, dispatcher)
                    }
                } else {
                    log.error({
                        title: 'App loading management plugin',
                        titleColor: LogPreDefinedColor.Yellow,
                        messages: [
                            `Invalid lang ${lang} in URL, defaulting to ${i18nStore.lang}`,
                            to,
                            from,
                        ],
                    })
                }
            }
        }
    })
}

export default appReadinessRouterPlugin
