<script setup>
import log from '@geoadmin/log'
import {
    ArcType,
    Color,
    HeightReference,
    HorizontalOrigin,
    KmlDataSource,
    LabelStyle,
    VerticalOrigin,
} from 'cesium'
import { computed, inject, toRef, watch } from 'vue'

import KMLLayer from '@/api/layers/KMLLayer.class'
import { DEFAULT_MARKER_HORIZONTAL_OFFSET } from '@/config/cesium.config'
import useAddDataSourceLayer from '@/modules/map/components/cesium/utils/useAddDataSourceLayer.composable'
import { getFeatureDescriptionMap } from '@/utils/kmlUtils'

const { kmlLayerConfig } = defineProps({
    kmlLayerConfig: {
        type: KMLLayer,
        required: true,
    },
})

const layerId = computed(() => kmlLayerConfig.id)
const kmlData = computed(() => kmlLayerConfig.kmlData)
const kmlStyle = computed(() => kmlLayerConfig.style)
const isClampedToGround = computed(() => kmlLayerConfig.clampToGround)
const layerOpacity = computed(() => kmlLayerConfig.opacity)

const getViewer = inject('getViewer')
const viewer = getViewer()

/** @returns {Promise<KmlDataSource>} */
async function createSource() {
    try {
        const kmlDataSource = await KmlDataSource.load( new Blob([kmlLayerConfig.kmzContent ??kmlData.value]), {
            clampToGround: isClampedToGround.value,
        })
        resetKmlDescription(kmlDataSource)
        return kmlDataSource
    } catch (error) {
        log.error(`[Cesium] Error while parsing KML data for layer ${layerId.value}`, error)
        throw error
    }
}

/**
 * This function is used to reset the description of the KML entities after the KML data has been
 * loaded. It is necessary because the cesium loader creates an html description for each entity. If
 * the KML description is not set it uses the geometry type as description. This is not the desired
 * behavior. Therefore we need to reset the description to the original KML description. The
 * description is changed in place.
 *
 * @param {KmlDataSource} kmlDataSource The KML data source
 */
function resetKmlDescription(kmlDataSource) {
    const descriptionMap = getFeatureDescriptionMap(kmlData.value)
    kmlDataSource.entities.values.forEach((entity) => {
        entity.description = descriptionMap.get(entity.id)
    })
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
        let imageUrl = null

        if (entity.billboard.image) {
            const imageValue = entity.billboard.image.getValue()

            if (typeof imageValue === 'string') {
                imageUrl = imageValue
            } else if (imageValue && imageValue.url) {
                imageUrl = imageValue.url
            }
        }

        const isDefaultMarker = !!imageUrl?.includes('001-marker')

        entity.billboard.heightReference = HeightReference.CLAMP_TO_GROUND
        entity.billboard.verticalOrigin = VerticalOrigin.CENTER
        entity.billboard.horizontalOrigin =
            HorizontalOrigin.CENTER + isDefaultMarker * DEFAULT_MARKER_HORIZONTAL_OFFSET
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
