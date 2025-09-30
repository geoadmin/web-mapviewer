import useFeaturesStore from '@/store/modules/features.store'
import useLayersStore from '@/store/modules/layers.store'
import useMapStore from '@/store/modules/map.store'
import type { PiniaPlugin } from 'pinia'

const dispatcher = { name: 'update-selected-features.plugin' }

/** @param store */
const updateSelectedFeatures: PiniaPlugin = () => {
    const layersStore = useLayersStore()
    const featuresStore = useFeaturesStore()
    const mapStore = useMapStore()

    layersStore.$onAction(({ name, store, args }) => {
        if (
            ![
                // 'setLayerYear',
                'toggleLayerVisibility',
                'addLayer',
                'removeLayer',
                'clearLayers',
            ].includes(name)
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
            const layer = store.activeLayers.at(args[0])

            if (layer?.isVisible) {
                updateFeatures = true // for toggleLayerVisibility we always update if layer has gone from invisible to visible
                // if the layer went from visible to invisible we need to check if there are selected features from this layer
            } else {
                layerId = layer?.id
            }
        }

        // if selected features do not have id of removed layer dont update features
        if (name === 'removeLayer' && args[0].layerId) {
            layerId = args[0].layerId
        }

        // removing a layer by index
        if (name === 'removeLayer' && args[0].index) {
            const layerByIndex = store.getActiveLayerByIndex(args[0].index)
            if (layerByIndex) {
                layerId = layerByIndex.id
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
                        layers: store.visibleLayers.filter((layer) => layer.hasTooltip),
                        vectorFeatures: clickInfo.features,
                        coordinate: clickInfo.coordinate,
                    },
                    dispatcher
                )
                .catch((_) => {})
        }
    })
}

export default updateSelectedFeatures
