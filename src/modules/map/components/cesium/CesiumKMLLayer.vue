<script setup>
import { Color, HeightReference, KmlDataSource, LabelStyle, VerticalOrigin } from 'cesium'
import { computed, inject, onBeforeUnmount, onMounted, toRefs, watch } from 'vue'

import KMLLayer from '@/api/layers/KMLLayer.class'

const props = defineProps({
    kmlLayerConfig: {
        type: KMLLayer,
        required: true,
    },
})

const { kmlLayerConfig } = toRefs(props)

const kmlData = computed(() => kmlLayerConfig.value.kmlData)

const getViewer = inject('getViewer', () => {}, true)

onMounted(addKmlLayer)
onBeforeUnmount(removeKmlLayer)

watch(kmlData, addKmlLayer)

let kmlDataSource = null

function removeKmlLayer() {
    if (kmlDataSource) {
        const viewer = getViewer()
        viewer.dataSources.remove(kmlDataSource)
        viewer.scene.requestRender()
    }
}

function addKmlLayer() {
    removeKmlLayer()
    if (kmlData.value) {
        new KmlDataSource.load(new Blob([kmlData.value]), { clampToGround: false }).then(
            (dataSource) => {
                kmlDataSource = dataSource
                // adding some visual improvements to KML feature, depending on their type
                kmlDataSource.entities.values.forEach((entity) => {
                    let geometry
                    let alphaToApply = 0.2
                    if (entity.ellipse) {
                        geometry = entity.ellipse
                    }
                    if (entity.polygon) {
                        geometry = entity.polygon
                    }
                    if (entity.polyline) {
                        geometry = entity.polyline
                        alphaToApply = 0.5
                    }
                    if (entity.billboard) {
                        entity.billboard.heightReference = HeightReference.CLAMP_TO_GROUND
                        entity.billboard.verticalOrigin = VerticalOrigin.BOTTOM
                    }
                    if (entity.label) {
                        const { label } = entity
                        label.disableDepthTestDistance = Number.POSITIVE_INFINITY
                        label.heightReference = HeightReference.CLAMP_TO_GROUND
                        label.verticalOrigin = VerticalOrigin.CENTER
                        label.outlineColor = Color.BLACK
                        label.outlineWidth = 2
                        label.style = LabelStyle.FILL_AND_OUTLINE
                    }
                    if (geometry) {
                        if (geometry.material?.color) {
                            geometry.material.color = geometry.material.color
                                .getValue()
                                .withAlpha(alphaToApply)
                        }
                    }
                })
                const viewer = getViewer()
                viewer.dataSources.add(kmlDataSource)
                viewer.scene.requestRender()
            }
        )
    }
}
</script>

<template>
    <slot />
</template>
