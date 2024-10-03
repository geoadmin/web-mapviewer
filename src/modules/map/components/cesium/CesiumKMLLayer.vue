<script setup>
import { ArcType, Color, HeightReference, KmlDataSource, LabelStyle, VerticalOrigin } from 'cesium'
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
const isExternal = computed(() => kmlLayerConfig.value.isExternal)
const opacity = computed(() => kmlLayerConfig.value.opacity)

const getViewer = inject('getViewer')

onMounted(addKmlLayer)
onBeforeUnmount(removeKmlLayer)

watch(kmlData, addKmlLayer)
watch(opacity, applyStyleToKmlEntities)

let kmlDataSource = null

function removeKmlLayer() {
    if (kmlDataSource) {
        const viewer = getViewer()
        viewer.dataSources.remove(kmlDataSource)
        viewer.scene.requestRender()
        kmlDataSource = null
    }
}

// adding some visual improvements to KML feature, depending on their type
function applyStyleToKmlEntities() {
    kmlDataSource.entities.values.forEach((entity) => {
        let geometry
        let alphaToApply = 0.8
        if (entity.ellipse) {
            geometry = entity.ellipse
        }
        if (entity.polygon) {
            geometry = entity.polygon
        }
        if (entity.polyline) {
            geometry = entity.polyline
            alphaToApply = 1.0
            if (!isExternal.value) {
                geometry.arcType = ArcType.GEODESIC
                geometry.clampToGround = true
            }
        }
        if (entity.billboard) {
            entity.billboard.heightReference = HeightReference.CLAMP_TO_GROUND
            entity.billboard.verticalOrigin = VerticalOrigin.BOTTOM
            entity.billboard.color = Color.WHITE.withAlpha(opacity.value)
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
                    .withAlpha(alphaToApply * opacity.value)
            }
        }
    })
    const viewer = getViewer()
    viewer.scene.requestRender()
}

function addKmlLayer() {
    removeKmlLayer()
    if (kmlData.value) {
        new KmlDataSource.load(new Blob([kmlData.value]), {
            clampToGround: !isExternal.value,
        }).then((dataSource) => {
            kmlDataSource = dataSource
            applyStyleToKmlEntities()
            const viewer = getViewer()
            viewer.dataSources.add(kmlDataSource)
            viewer.scene.requestRender()
        })
    }
}
</script>

<template>
    <slot />
</template>
