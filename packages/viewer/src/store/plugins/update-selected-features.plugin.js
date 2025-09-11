const dispatcher = { dispatcher: 'update-selected-features.plugin' }

/** @param store */
const updateSelectedFeaturesPlugin = (store) => {
    store.subscribe((mutation) => {
        if (
            ![
                'setLayerYear',
                'toggleLayerVisibility',
                'addLayer',
                'removeLayerByIndex',
                'removeLayersById',
                'clearLayers',
            ].includes(mutation.type)
        ) {
            return
        }
        const selectedFeatures = store.getters.selectedFeatures
        const clickInfo = store.state.map.clickInfo
        // when clicked on the map and no feature is selected we don't want to re run the identify features
        if (!clickInfo || (clickInfo.coordinate.length === 2 && selectedFeatures.length === 0)) {
            return
        }
        let updateFeatures = true // for 'setLayerYear', 'addLayer', 'clearLayers', 'removeLayerByIndex' we always update
        let layerId
        // if selected features do not have id of removed layer dont update features
        if (['toggleLayerVisibility'].includes(mutation.type)) {
            const layer = store.state.layers.activeLayers.at(mutation.payload.index)
            if (layer?.visible) {
                updateFeatures = true // for toggleLayerVisibility we always update if layer has gone from invisible to visible
                // if the layer went from visible to invisible we need to check if there are selected features from this layer
            } else {
                layerId = layer?.id
            }
        }
        // if selected features do not have id of removed layer dont update features
        if (['removeLayersById'].includes(mutation.type)) {
            layerId = mutation.payload.layerId
        }

        if (layerId) {
            updateFeatures = selectedFeatures.some((feature) => feature.layer.id === layerId)
        }

        if (updateFeatures) {
            store.dispatch('identifyFeatureAt', {
                layers: store.getters.visibleLayers.filter((layer) => layer.hasTooltip),
                vectorFeatures: clickInfo.features,
                coordinate: clickInfo.coordinate,
                ...dispatcher,
            })
        }
    })
}

export default updateSelectedFeaturesPlugin
