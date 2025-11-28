import { loadGeoadminLayersConfig } from '@swissgeo/layers/api'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

import { loadTopics, parseTopics } from '@/api/topics.api'
import useI18nStore from '@/store/modules/i18n'
import useTopicsStore from '@/store/modules/topics'

interface LoadLayersConfigOptions {
    changeLayersOnTopicChange?: boolean
    openGeocatalogSection?: boolean
}

export default function loadLayersConfig(
    this: LayersStore,
    options: LoadLayersConfigOptions,
    dispatcher: ActionDispatcher
): void {
    const i18nStore = useI18nStore()
    const topicsStore = useTopicsStore()

    const lang = i18nStore.lang
    const topicId = topicsStore.current

    log.debug({
        title: 'Layers store / loadLayersConfig',
        titleColor: LogPreDefinedColor.Sky,
        messages: [
            `Start loading layers config and topics lang=${lang} topic=${topicId} dispatcher=${dispatcher.name}`,
        ],
    })
    Promise.all([loadGeoadminLayersConfig(lang), loadTopics()])
        .then(([layersConfig, rawTopics]) => {
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
            this.setLayerConfig(layersConfig, dispatcher)
            topicsStore.setTopics(
                topics,
                {
                    changeLayers: options.changeLayersOnTopicChange,
                    openGeocatalogSection: options.openGeocatalogSection,
                },
                dispatcher
            )
            log.debug({
                title: 'Layers store / loadLayersConfig',
                titleColor: LogPreDefinedColor.Sky,
                messages: [`layers config and topics dispatched`],
            })
        })
        .catch((error) => {
            log.error({
                title: 'Layers store / loadLayersConfig',
                titleColor: LogPreDefinedColor.Sky,
                messages: ['Error while loading the layers config', error],
            })
        })
}
