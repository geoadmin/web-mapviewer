<script setup>
import { ArcType, Color, HeightReference, KmlDataSource, LabelStyle, VerticalOrigin } from 'cesium'
import log from 'geoadmin/log'
import { computed, inject, toRef, toRefs, watch } from 'vue'

import KMLLayer from '@/api/layers/KMLLayer.class'
import useAddDataSourceLayer from '@/modules/map/components/cesium/utils/useAddDataSourceLayer.composable'

const props = defineProps({
    kmlLayerConfig: {
        type: KMLLayer,
        required: true,
    },
})

const { kmlLayerConfig } = toRefs(props)

const layerId = computed(() => kmlLayerConfig.value.id)
const kmlData = computed(() => kmlLayerConfig.value.kmlData)
const kmlStyle = computed(() => kmlLayerConfig.value.style)
const isClampedToGround = computed(() => kmlLayerConfig.value.clampToGround)
const layerOpacity = computed(() => kmlLayerConfig.value.opacity)

const getViewer = inject('getViewer')
const viewer = getViewer()

/** @returns {Promise<KmlDataSource>} */
async function createSource() {
    try {
        return await KmlDataSource.load(new Blob([kmlData.value]), {
            clampToGround: isClampedToGround.value,
        })
    } catch (error) {
        log.error(`[Cesium] Error while parsing KML data for layer ${layerId.value}`, error)
        throw error
    }
}

// adding some visual improvements to KML feature, depending on their type
function applyStyleToKmlEntity(entity, opacity) {
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
        if (isClampedToGround.value) {
            geometry.arcType = ArcType.GEODESIC
            geometry.clampToGround = true
        }
    }
    if (entity.billboard) {
        entity.billboard.heightReference = HeightReference.CLAMP_TO_GROUND
        entity.billboard.verticalOrigin = VerticalOrigin.BOTTOM
        entity.billboard.color = Color.WHITE.withAlpha(opacity)
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
                .withAlpha(alphaToApply * opacity)
        }
    }
}

const { refreshDataSource } = useAddDataSourceLayer(
    viewer,
    createSource(),
    applyStyleToKmlEntity,
    toRef(layerOpacity),
    toRef(layerId)
)

watch(kmlData, () => refreshDataSource(createSource()))
watch(kmlStyle, () => refreshDataSource(createSource()))
watch(isClampedToGround, () => refreshDataSource(createSource()))
</script>

<template>
    <slot />
</template>
