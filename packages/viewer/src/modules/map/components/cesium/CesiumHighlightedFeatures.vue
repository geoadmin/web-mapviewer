<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { LineString, Point, Polygon } from 'ol/geom'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import useFeaturesStore from '@/store/modules/features.store'
import useUIStore from '@/store/modules/ui.store'

import { LayerType } from '@swissgeo/layers'
import type { Viewer } from 'cesium'
import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import FeatureStyleEdit from '@/modules/infobox/components/styling/FeatureStyleEdit.vue'
import CesiumPopover from '@/modules/map/components/cesium/CesiumPopover.vue'
import {
    highlightGroup,
    unhighlightGroup,
} from '@/modules/map/components/cesium/utils/highlightUtils'
import { FeatureInfoPositions } from '@/store/modules/ui.store'
import usePositionStore from '@/store/modules/position.store'
import type { EditableFeature, LayerFeature } from '@/api/features.api'
import useMapStore from '@/store/modules/map.store'
import type { ActionDispatcher } from '@/store/types'
import type { SingleCoordinate } from '@swissgeo/coordinates'
const dispatcher: ActionDispatcher = { name: 'CesiumHighlightedFeatures.vue' }

const { t } = useI18n()

const popoverCoordinates = ref<number[] | number[][]>([])

const getViewer = inject<() => Viewer | undefined>('getViewer')

const featuresStore = useFeaturesStore()
const uiStore = useUIStore()

const positionStore = usePositionStore()
const projection = computed(() => positionStore.projection)
const selectedFeatures = computed(() => featuresStore.selectedFeatures)
const isFeatureInfoInTooltip = computed(() => uiStore.showFeatureInfoInTooltip)
const mapStore = useMapStore()

const showFeaturesPopover = computed(
    () => isFeatureInfoInTooltip.value && selectedFeatures.value.length > 0
)
const editFeature = computed(() => selectedFeatures.value.find((feature) => feature.isEditable))

watch(
    selectedFeatures,
    (newSelectedFeatures) => {
        if (newSelectedFeatures.length > 0) {
            highlightSelectedFeatures()
        } else {
            // To un highlight the features when the layer is removed or the visibility is set to false
            const viewer = getViewer?.()
            if (viewer) {
                unhighlightGroup(viewer)
            }
        }
    },
    {
        deep: true,
        immediate: true,
    }
)

onMounted(() => {
    if (selectedFeatures.value.length > 0) {
        highlightSelectedFeatures()
    }
})

function highlightSelectedFeatures(): void {
    const viewer = getViewer?.()
    if (!viewer) {
        return
    }
    const [firstFeature] = selectedFeatures.value

    const geometries = selectedFeatures.value.map((f) => {
        // Cesium Layers are highlighted through cesium itself, so we don't
        // give anything to the highlighter.
        // Only LayerFeature has a 'layer' property
        const hasLayer = (obj: LayerFeature | EditableFeature): obj is LayerFeature =>
            !!obj && typeof obj === 'object' && 'layer' in obj
        if (hasLayer(f) && f.layer.type === LayerType.VECTOR && 'use3dTileSubFolder' in f.layer) {
            return undefined
        }
        // GeoJSON and KML layers have different geometry structure
        if (!f.geometry || !f.geometry?.type) {
            let type
            let coordinates
            if (f.geometry! instanceof Polygon) {
                type = 'Polygon'
                coordinates = (f.geometry as Polygon).getCoordinates()
            } else if (f.geometry! instanceof LineString) {
                type = 'LineString'
                coordinates = (f.geometry as LineString).getCoordinates()
            } else if (f.geometry! instanceof Point) {
                type = 'Point'
                coordinates = (f.geometry as Point).getCoordinates()
            }
            // OL geometries
            return {
                type,
                coordinates,
            }
        }
        return f.geometry
    })
    highlightGroup(viewer, geometries)
    if (firstFeature && Array.isArray(firstFeature.coordinates)) {
        const coords = firstFeature.coordinates
        popoverCoordinates.value = Array.isArray(coords[0])
            ? (coords[coords.length - 1] as number[])
            : (coords as number[])
    }
}
function onPopupClose() {
    const viewer = getViewer?.()
    if (viewer) {
        unhighlightGroup(viewer)
        featuresStore.clearAllSelectedFeatures(dispatcher)
        mapStore.clearClick(dispatcher)
    }
}
function setBottomPanelFeatureInfoPosition() {
    uiStore.setFeatureInfoPosition(FeatureInfoPositions.BOTTOMPANEL, dispatcher)
}
</script>

<template>
    <CesiumPopover
        v-if="showFeaturesPopover"
        :coordinates="
            (Array.isArray(popoverCoordinates) && Array.isArray(popoverCoordinates[0])
                ? popoverCoordinates[popoverCoordinates.length - 1]
                : popoverCoordinates) as SingleCoordinate
        "
        :projection="projection"
        authorize-print
        :title="t('object_information')"
        :use-content-padding="!!editFeature"
        @close="onPopupClose"
    >
        <template #extra-buttons>
            <button
                class="btn btn-sm btn-light d-flex align-items-center"
                data-cy="toggle-floating-off"
                @click="setBottomPanelFeatureInfoPosition()"
                @mousedown.stop=""
            >
                <FontAwesomeIcon icon="angles-down" />
            </button>
        </template>
        <FeatureStyleEdit
            v-if="editFeature"
            :feature="editFeature"
            read-only
        />
        <FeatureList />
    </CesiumPopover>
</template>
