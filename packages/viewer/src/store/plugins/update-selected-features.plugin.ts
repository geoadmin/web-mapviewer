import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import log from '@swissgeo/log'

import type { ActionDispatcher } from '@/store/types'

import useFeaturesStore from '@/store/modules/features.store'
import useLayersStore, { LayerStoreActions } from '@/store/modules/layers.store'
import useMapStore from '@/store/modules/map.store'
import { isEnumValue } from '@/utils/utils'

const dispatcher: ActionDispatcher = { name: 'update-selected-features.plugin' }

const updateSelectedFeatures: PiniaPlugin = (context: PiniaPluginContext) => {
    const { store } = context

    const layersStore = useLayersStore()
    const featuresStore = useFeaturesStore()
    const mapStore = useMapStore()

    store.$onAction(({ name, args }) => {
        if (
            !isEnumValue<LayerStoreActions>(LayerStoreActions.ToggleLayerVisibility, name) &&
            !isEnumValue<LayerStoreActions>(LayerStoreActions.AddLayer, name) &&
            !isEnumValue<LayerStoreActions>(LayerStoreActions.RemoveLayer, name) &&
            !isEnumValue<LayerStoreActions>(LayerStoreActions.ClearLayers, name)
        ) {
            return
        }

        const selectedFeatures = featuresStore.selectedFeatures
        const clickInfo = mapStore.clickInfo

        // when clicked on the map and no feature is selected we don't want to re run the identify features
        if (!clickInfo || (clickInfo.coordinate.length === 2 && selectedFeatures.length === 0)) {
            return
        }

        let updateFeatures = true // for 'setLayerYear', 'addLayer', 'clearLayers', 'removeLayerByIndex' we always update
        let layerId

        // if selected features do not have id of removed layer dont update features
        if (isEnumValue<LayerStoreActions>(LayerStoreActions.ToggleLayerVisibility, name)) {
            const [layerIndex] = args as Parameters<typeof layersStore.toggleLayerVisibility>
            const layer = layersStore.getActiveLayerByIndex(layerIndex)

            if (layer?.isVisible) {
                updateFeatures = true // for toggleLayerVisibility we always update if layer has gone from invisible to visible
                // if the layer went from visible to invisible we need to check if there are selected features from this layer
            } else {
                layerId = layer?.id
            }
        }

        // if selected features do not have id of removed layer dont update features
        if (isEnumValue<LayerStoreActions>(LayerStoreActions.RemoveLayer, name)) {
            const [payload] = args as Parameters<typeof layersStore.removeLayer>
            if (payload.layerId) {
                layerId = payload.layerId
            } else if (payload.index) {
                // removing a layer by index
                const layerByIndex = layersStore.getActiveLayerByIndex(payload.index)
                if (layerByIndex) {
                    layerId = layerByIndex.id
                }
            }
        }

        if (layerId) {
            updateFeatures = selectedFeatures.some(
                (feature) => 'layer' in feature && feature.layer.id === layerId
            )
        }

        if (updateFeatures && clickInfo.features) {
            featuresStore
                .identifyFeatureAt(
                    {
                        layers: layersStore.visibleLayers.filter((layer) => layer.hasTooltip),
                        vectorFeatures: clickInfo.features,
                        coordinate: clickInfo.coordinate,
                    },
                    dispatcher
                )
                .catch((error) => {
                    log.error({
                        title: 'Update selected features plugin',
                        messages: [
                            'Error while updating selected features after a click on the map',
                            args,
                            error,
                        ],
                    })
                })
        }
    })
}

export default updateSelectedFeatures
