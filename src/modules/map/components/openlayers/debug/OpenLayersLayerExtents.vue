<script setup>
import Feature from 'ol/Feature'
import { Polygon } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Fill, Stroke, Style, Text } from 'ol/style'
import { computed, inject, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import ExternalLayer from '@/api/layers/ExternalLayer.class'
import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/add-layers-to-map.composable'
import { LV95 } from '@/utils/coordinates/coordinateSystems'

const props = defineProps({
    zIndex: {
        type: Number,
        default: -1,
    },
})
const { zIndex } = toRefs(props)

const store = useStore()
const currentProjection = computed(() => store.state.position.projection)
const allLayers = computed(() => {
    const layers = []
    if (store.state.layers.currentBackgroundLayer) {
        layers.push(store.state.layers.currentBackgroundLayer)
    }
    layers.push(...store.getters.visibleLayers)
    return layers
})

const layer = new VectorLayer({
    source: createVectorSourceForProjection(),
    style: (feature) => {
        // using a random color for each extent
        // https://css-tricks.com/snippets/javascript/random-hex-color/
        const randomColor = `#${Math.floor(Math.random() * 0xffffff).toString(16)}`
        return new Style({
            stroke: new Stroke({
                color: randomColor,
                width: 4,
            }),
            text: new Text({
                font: 'bold 16px sans-serif',
                text: feature.get('name'),
                fill: new Fill({
                    color: randomColor,
                }),
                stroke: new Stroke({
                    color: 'black',
                    width: 3,
                }),
                placement: 'line',
                overflow: true,
                offsetY: 16,
            }),
        })
    },
})

const olMap = inject('olMap', null)
useAddLayerToMap(layer, olMap, zIndex)

watch(currentProjection, () => layer.setSource(createVectorSourceForProjection()))
watch(allLayers, () => layer.setSource(createVectorSourceForProjection()))

function createFeaturesForEachLayerExtent() {
    const extents = []
    if (allLayers.value.some((layer) => layer instanceof GeoAdminLayer)) {
        const bounds = LV95.getBoundsAs(currentProjection.value)
        extents.push(
            new Feature({
                geometry: new Polygon([
                    [
                        [bounds.lowerX, bounds.lowerY],
                        [bounds.upperX, bounds.lowerY],
                        [bounds.upperX, bounds.upperY],
                        [bounds.lowerX, bounds.upperY],
                        [bounds.lowerX, bounds.lowerY],
                    ],
                ]),
                name: 'LV95',
            })
        )
    }
    allLayers.value
        .filter((layer) => layer instanceof ExternalLayer && layer.extent)
        .forEach((layer) => {
            extents.push(
                new Feature({
                    geometry: new Polygon([
                        [
                            layer.extent[1],
                            [layer.extent[1][0], layer.extent[0][1]],
                            layer.extent[0],
                            [layer.extent[0][0], layer.extent[1][1]],
                            layer.extent[1],
                        ],
                    ]),
                    name: layer.externalLayerId,
                })
            )
        })
    return extents
}

function createVectorSourceForProjection() {
    return new VectorSource({
        projection: currentProjection.value.epsg,
        features: createFeaturesForEachLayerExtent(),
    })
}
</script>

<template>
    <slot />
</template>
