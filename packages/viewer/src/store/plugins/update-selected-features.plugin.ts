import type { Layer } from '@swissgeo/layers'
import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

import useFeaturesStore from '@/store/modules/features'
import useLayersStore from '@/store/modules/layers'
import useMapStore from '@/store/modules/map'

const dispatcher: ActionDispatcher = { name: 'update-selected-features.plugin' }

const updateSelectedFeatures: PiniaPlugin = (context: PiniaPluginContext) => {
    const { store } = context

    const layersStore = useLayersStore()
    const featuresStore = useFeaturesStore()
    const mapStore = useMapStore()

    store.$onAction(({ name, args }) => {
        if (
            'toggleLayerVisibility' !== name &&
            'addLayer' !== name &&
            'removeLayer' !== name &&
            'clearLayers' !== name
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
        if (name === 'toggleLayerVisibility') {
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
        if (name === 'removeLayer') {
            const [input] = args as Parameters<typeof layersStore.removeLayer>

            if (typeof input === 'string') {
                layerId = input
            } else if (typeof input === 'number') {
                // removing a layer by index
                const layerByIndex = layersStore.getActiveLayerByIndex(input)
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
            featuresStore.identifyFeatureAt(
                layersStore.visibleLayers.filter((layer: Layer) => layer.hasTooltip),
                clickInfo.coordinate,
                clickInfo.features,
                dispatcher
            )
        }
    })
}

export default updateSelectedFeatures
