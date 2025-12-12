<script setup lang="ts">
import type { KMLLayer } from '@swissgeo/layers'
import type { Entity, KmlDataSource as KmlDataSourceType, Viewer } from 'cesium'
import type { ShallowRef } from 'vue'

import log from '@swissgeo/log'
import {
    ArcType,
    Color,
    ColorMaterialProperty,
    ConstantProperty,
    HeightReference,
    HorizontalOrigin,
    KmlDataSource,
    LabelStyle,
    VerticalOrigin,
} from 'cesium'
import { computed, inject, toRef, watch } from 'vue'

import { DEFAULT_MARKER_HORIZONTAL_OFFSET } from '@/config/cesium.config'
import useAddDataSourceLayer from '@/modules/map/components/cesium/utils/useAddDataSourceLayer.composable'
import { getFeatureDescriptionMap } from '@/utils/kmlUtils'

const { kmlLayerConfig } = defineProps<{ kmlLayerConfig: KMLLayer }>()

const kmlData = computed(() => kmlLayerConfig.kmlData)
const kmlStyle = computed(() => kmlLayerConfig.style)
const isClampedToGround = computed(() => kmlLayerConfig.clampToGround)

const viewer = inject<ShallowRef<Viewer | undefined>>('viewer')
if (!viewer?.value) {
    log.error({
        title: 'CesiumKMLLayer.vue',
        messages: ['Viewer not initialized, cannot create KML layer'],
    })
    throw new Error('Viewer not initialized, cannot create KML layer')
}

async function createSource(): Promise<KmlDataSourceType> {
    try {
        const kmlDataSource = await KmlDataSource.load(new Blob([kmlLayerConfig.kmzContent ?? kmlData.value ?? '']), {
            clampToGround: isClampedToGround.value,
        })
        resetKmlDescription(kmlDataSource)
        return kmlDataSource
    } catch (error: unknown) {
        log.error({
            title: 'Cesium',
            messages: [`Error while parsing KML data for layer ${kmlLayerConfig.id}`, error],
        })
        throw error
    }
}

/**
 * This function is used to reset the description of the KML entities after the KML data has been
 * loaded. It is necessary because the cesium loader creates an html description for each entity. If
 * the KML description is not set it uses the geometry type as description. This is not the desired
 * behavior. Therefore we need to reset the description to the original KML description. The
 * description is changed in place.
 */
function resetKmlDescription(kmlDataSource: KmlDataSource) {
    const descriptionMap = getFeatureDescriptionMap(kmlData.value ?? '')
    kmlDataSource.entities.values.forEach((entity: Entity) => {
        entity.description = new ConstantProperty(descriptionMap.get(entity.id)!)
    })
}

// adding some visual improvements to KML feature, depending on their type
function applyStyleToKmlEntity(entity: Entity, opacity: number) {
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
            geometry.arcType = new ConstantProperty(ArcType.GEODESIC)
            geometry.clampToGround = new ConstantProperty(true)
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

        entity.billboard.heightReference = new ConstantProperty(HeightReference.CLAMP_TO_GROUND)
        entity.billboard.verticalOrigin = new ConstantProperty(VerticalOrigin.CENTER)
        entity.billboard.horizontalOrigin = new ConstantProperty(
            (HorizontalOrigin.CENTER as number) +
                (isDefaultMarker ? DEFAULT_MARKER_HORIZONTAL_OFFSET : 0)
        )
        entity.billboard.color = new ConstantProperty(Color.WHITE.withAlpha(opacity))
    }
    if (entity.label) {
        const { label } = entity
        label.disableDepthTestDistance = new ConstantProperty(Number.POSITIVE_INFINITY)
        label.heightReference = new ConstantProperty(HeightReference.CLAMP_TO_GROUND)
        label.verticalOrigin = new ConstantProperty(VerticalOrigin.CENTER)
        label.outlineColor = new ConstantProperty(Color.BLACK)
        label.outlineWidth = new ConstantProperty(2)
        label.style = new ConstantProperty(LabelStyle.FILL_AND_OUTLINE)
    }
    if (geometry) {
        if (geometry.material instanceof ColorMaterialProperty && geometry.material.color) {
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
    toRef(kmlLayerConfig.opacity),
    toRef(kmlLayerConfig.id)
)

watch(kmlData, () => refreshDataSource(createSource()))
watch(kmlStyle, () => refreshDataSource(createSource()))
watch(isClampedToGround, () => refreshDataSource(createSource()))
</script>

<template>
    <slot />
</template>
