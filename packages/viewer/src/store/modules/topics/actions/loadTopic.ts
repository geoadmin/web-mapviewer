import { topicsAPI } from '@swissgeo/api'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LoadTopicOptions, TopicsStore } from '@/store/modules/topics/types'
import type { ActionDispatcher } from '@/store/types'

import { ENVIRONMENT } from '@/config'
import useI18nStore from '@/store/modules/i18n'
import useLayersStore from '@/store/modules/layers'
import useUIStore from '@/store/modules/ui'

export default function loadTopic(
    this: TopicsStore,
    options: LoadTopicOptions,
    dispatcher: ActionDispatcher
): void {
    const i18nStore = useI18nStore()
    const layersStore = useLayersStore()
    const uiStore = useUIStore()

    const {
        changeLayers,
        openGeocatalogSection,
        changeBackgroundLayer = true
    } = options

    topicsAPI
        .loadTopicTreeForTopic(i18nStore.lang, this.current, layersStore.config)
        .then(({ tree, warnings }) => {

            if (ENVIRONMENT === 'development' && warnings.length > 0) {
                uiStore.addWarnings(warnings, dispatcher)
            }
            if (!this.currentTopic) {
                return
            }
            this.setTopicTree(tree.layers, dispatcher)
            if (openGeocatalogSection) {
                this.setTopicTreeOpenedThemesIds([this.current, ...tree.itemIdToOpen], dispatcher)
            }
            // by default, if nothing is specified, we change the background layer
            if (changeBackgroundLayer) {
                if (this.currentTopic.defaultBackgroundLayer) {
                    layersStore.setBackground(this.currentTopic.defaultBackgroundLayer.id, dispatcher)
                } else if (changeLayers) {
                    layersStore.setBackground(undefined, dispatcher)
                }
            }
            if (changeLayers) {
                if (this.currentTopic.layersToActivate) {
                    layersStore.setLayers(this.currentTopic.layersToActivate, dispatcher)
                }
            }
            if (this.currentTopic.layersToActivate) {
                const layersStore = useLayersStore()
                // Get IDs of currently active layers
                const activeLayerIds = new Set(layersStore.activeLayers.map((layer) => layer.id))

                // Create a map of active layers by ID for quick lookup with their time configs
                const activeLayersMap = new Map(
                    layersStore.activeLayers.map((layer) => [layer.id, layer])
                )

                // Filter layersToActivate to only include layers that are currently active
                const layersToKeep = this.currentTopic.layersToActivate
                    .filter((layer) => activeLayerIds.has(layer.id))
                    .map((layer) => {
                        const activeLayer = activeLayersMap.get(layer.id)
                        layer.isVisible = activeLayer?.isVisible || false
                        // If the active layer has a time config and current time entry, update the new layer's time config
                        if (activeLayer?.timeConfig?.currentTimeEntry && layer.timeConfig) {
                            layer.timeConfig.currentTimeEntry =
                                activeLayer.timeConfig.currentTimeEntry
                        }

                        return layer
                    })
                // Only set layers if there are any to keep
                if (layersToKeep.length > 0) {
                    layersStore.setLayers(layersToKeep, dispatcher)
                }
            }
        })
        .catch((error) => {
            log.error({
                title: 'Topics store',
                titleStyle: {
                    backgroundColor: LogPreDefinedColor.Red,
                },
                messages: ['Error while loading topic tree', error],
            })
        })
}
