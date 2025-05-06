import log from '@geoadmin/log'
import { inject, onBeforeUnmount, onMounted, toValue, watch } from 'vue'

export default function useAddTileLayer(layer, sourceId, source, opacity, previousLayerId) {
    const getMapLibreMap = inject('getMapLibreMap', () => undefined, true)

    addLayerAndSourceToMap(toValue(layer), toValue(sourceId), toValue(source))

    onMounted(() => {
        addLayerAndSourceToMap(toValue(layer), toValue(sourceId), toValue(source))
    })

    onBeforeUnmount(() => {
        removeLayerAndSourceFromMap(toValue(layer))
    })

    watch(
        () => toValue(previousLayerId),
        () => {
            removeLayerFromMap(toValue(layer))
            addSourceToMap(toValue(sourceId), toValue(source))
            addLayerToMap(toValue(layer), toValue(previousLayerId))
        }
    )
    watch(
        () => toValue(source),
        () => {
            removeLayerAndSourceFromMap(toValue(layer))
            addLayerAndSourceToMap(toValue(layer), toValue(sourceId), toValue(source))
        },
        {
            deep: true,
        }
    )
    watch(opacity, () => {
        const mapLibreMap = getMapLibreMap()
        if (mapLibreMap?.getLayer(toValue(layer).id)) {
            mapLibreMap.setPaintProperty(toValue(layer).id, 'raster-opacity', opacity.value)
        }
    })

    function addSourceToMap(sourceId, source) {
        const mapLibreMap = getMapLibreMap()
        if (!mapLibreMap || !sourceId || !source || !!mapLibreMap.getSource(sourceId)) {
            return false
        }
        mapLibreMap.addSource(sourceId, source)
        return true
    }

    function addLayerToMap(layer, previousLayerId) {
        const mapLibreMap = getMapLibreMap()
        if (!mapLibreMap || !layer) {
            return
        }
        if (toValue(previousLayerId)) {
            mapLibreMap.addLayer(layer, toValue(previousLayerId))
        } else {
            const mapLibreLayers = mapLibreMap.getStyle().layers
            // Find the index of the first symbol layer in the map style
            const firstSymbolLayer = mapLibreLayers.find((layer) => layer.type === 'symbol')
            mapLibreMap.addLayer(layer, firstSymbolLayer?.id)
        }
        mapLibreMap.setPaintProperty(layer.id, 'raster-opacity', opacity.value)
    }

    function addLayerAndSourceToMap(layer, sourceId, source) {
        if (addSourceToMap(sourceId, source)) {
            addLayerToMap(layer, previousLayerId)
        } else {
            log.error('Could not add source to map', sourceId, source)
        }
    }

    function removeSourceFromMap() {
        const mapLibreMap = getMapLibreMap()
        if (toValue(sourceId) && mapLibreMap.getSource(toValue(sourceId))) {
            mapLibreMap.removeSource(toValue(sourceId))
        }
    }

    function removeLayerFromMap(layer) {
        const mapLibreMap = getMapLibreMap()
        if (!mapLibreMap || !layer) {
            return
        }
        if (mapLibreMap.getLayer(layer.id)) {
            mapLibreMap.removeLayer(layer.id)
        }
    }

    function removeLayerAndSourceFromMap(layer) {
        removeLayerFromMap(layer)
        removeSourceFromMap()
    }
}
