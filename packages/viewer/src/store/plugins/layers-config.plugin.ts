import log, { LogPreDefinedColor } from '@swissgeo/log'
import type { GeoAdminLayer } from '@swissgeo/layers'
import { loadGeoadminLayersConfig } from '@swissgeo/layers/api'

import { loadTopics, parseTopics } from '@/api/topics.api'
import type { ActionDispatcher } from '@/store/types'
import type { SupportedLang } from '@/modules/i18n'
import type { PiniaPlugin } from 'pinia'
import { useI18nStore } from '@/store/modules/i18n.store'
import useTopicsStore from '@/store/modules/topics.store'
import useLayersStore from '@/store/modules/layers.store'
import useDebugStore from '@/store/modules/debug.store'

const dispatcher: ActionDispatcher = { name: 'layers-config.plugin' }

/**
 * Local storage of layers config, so that if a language has already been loaded, we don't reload it
 * from the backend the second time (will disappear on page reload)
 */
const layersConfigByLang: Record<SupportedLang, GeoAdminLayer[]> = {
    en: [],
    de: [],
    fr: [],
    it: [],
    rm: [],
}

/**
 * Loads the whole config from the backend (aka LayersConfig) for a specific language and store it
 * in a cache
 *
 * If the same language is asked another time later on, the cached version will be given.
 */
async function loadLayersConfig(lang: SupportedLang): Promise<GeoAdminLayer[]> {
    if (layersConfigByLang[lang].length === 0) {
        layersConfigByLang[lang] = await loadGeoadminLayersConfig(lang)
    }
    return layersConfigByLang[lang]
}

async function loadLayersAndTopicsConfigAndDispatchToStore(
    dispatcher: ActionDispatcher
): Promise<void> {
    const i18nStore = useI18nStore()
    const layersStore = useLayersStore()
    const topicsStore = useTopicsStore()

    const lang = i18nStore.lang
    const topicId = topicsStore.current

    try {
        log.debug({
            title: 'Loading layers config',
            titleColor: LogPreDefinedColor.Sky,
            messages: [
                `Start loading layers config and topics lang=${lang} topic=${topicId} dispatcher=${dispatcher.name}`,
            ],
        })
        const [layersConfig, rawTopics] = await Promise.all([loadLayersConfig(lang), loadTopics()])
        const topics = parseTopics(layersConfig, rawTopics)

        // adding SWISSIMAGE as a possible background for 3D
        const swissimage = layersConfig.find((layer) => layer.id === 'ch.swisstopo.swissimage')
        const swissimage3d = layersConfig.find(
            (layer) => layer.id === 'ch.swisstopo.swissimage-product_3d'
        )
        if (swissimage && swissimage3d) {
            swissimage3d.isBackground = true
            swissimage.idIn3d = swissimage3d.id
        }

        layersStore.setLayerConfig(layersConfig, dispatcher)
        topicsStore.setTopics(topics, dispatcher)
        log.debug({
            title: 'Loading layers config',
            titleColor: LogPreDefinedColor.Sky,
            messages: [`layers config and topics dispatched`],
        })
    } catch (error) {
        log.error({
            title: 'Loading layers config',
            titleColor: LogPreDefinedColor.Sky,
            messages: ['Error while loading the layers config', error],
        })
    }
}

/** Reload (if necessary from the backend) the layers config on language change */
const layersConfigPlugin: PiniaPlugin = (): void => {
    const i18nStore = useI18nStore()
    const debugstore = useDebugStore()

    const afterAction = () => {
        loadLayersAndTopicsConfigAndDispatchToStore(dispatcher)
            .then(() => {
                log.debug({
                    title: 'Loading layers config',
                    titleColor: LogPreDefinedColor.Sky,
                    messages: ['Layers config for new lang loaded with success'],
                })
            })
            .catch((err) => {
                log.error({
                    title: 'Loading layers config',
                    titleColor: LogPreDefinedColor.Sky,
                    messages: ['Error while loading the layers config for the new lang', err],
                })
            })
    }

    i18nStore.$onAction(({ after, name }) => {
        if (name === 'setLang') {
            after(afterAction)
        }
    })

    debugstore.$onAction(({ after, name }) => {
        if (name === 'setHasBaseUrlOverrides') {
            // in case of changes in URL overrides, we clear the layers config cache
            if (name === 'setHasBaseUrlOverrides') {
                layersConfigByLang.en = []
                layersConfigByLang.de = []
                layersConfigByLang.fr = []
                layersConfigByLang.it = []
                layersConfigByLang.rm = []
            }
            after(afterAction)
        }
    })
}

export default layersConfigPlugin
