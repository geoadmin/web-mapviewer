<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { LineString, Point, Polygon } from 'ol/geom'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import FeatureEdit from '@/modules/infobox/components/FeatureEdit.vue'
import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import CesiumPopover from '@/modules/map/components/cesium/CesiumPopover.vue'
import {
    highlightGroup,
    unhighlightGroup,
} from '@/modules/map/components/cesium/utils/highlightUtils'
import { FeatureInfoPositions } from '@/store/modules/ui.store'

const dispatcher = {
    dispatcher: 'CesiumHighlightedFeatures.vue',
}

const popoverCoordinates = ref([])

const getViewer = inject('getViewer')

const store = useStore()
const projection = computed(() => store.state.position.projection)
const selectedFeatures = computed(() => store.getters.selectedFeatures)
const isFeatureInfoInTooltip = computed(() => store.getters.showFeatureInfoInTooltip)
const showFeaturesPopover = computed(
    () => isFeatureInfoInTooltip.value && selectedFeatures.value.length > 0
)
const editFeature = computed(() => selectedFeatures.value.find((feature) => feature.isEditable))

watch(
    selectedFeatures,
    (newSelectedFeatures) => {
        if (newSelectedFeatures.length > 0) {
            highlightSelectedFeatures()
        }
    },
    {
        deep: true,
    }
)

onMounted(() => {
    if (selectedFeatures.value.length > 0) {
        highlightSelectedFeatures()
    }
})

function highlightSelectedFeatures() {
    const viewer = getViewer()
    if (!viewer) {
        return
    }
    const [firstFeature] = selectedFeatures.value
    const geometries = selectedFeatures.value.map((f) => {
        // GeoJSON and KML layers have different geometry structure
        if (!f.geometry.type) {
            let type
            if (f.geometry instanceof Polygon) {
                type = 'Polygon'
            } else if (f.geometry instanceof LineString) {
                type = 'LineString'
            } else if (f.geometry instanceof Point) {
                type = 'Point'
            }
            const coordinates = f.geometry.getCoordinates()
            return {
                type,
                coordinates,
            }
        }
        return f.geometry
    })
    highlightGroup(viewer, geometries)
    popoverCoordinates.value = Array.isArray(firstFeature.coordinates[0])
        ? firstFeature.coordinates[firstFeature.coordinates.length - 1]
        : firstFeature.coordinates
}
function onPopupClose() {
    const viewer = getViewer()
    if (viewer) {
        unhighlightGroup(viewer)
        store.dispatch('clearAllSelectedFeatures', dispatcher)
        store.dispatch('clearClick', dispatcher)
    }
}
function setBottomPanelFeatureInfoPosition() {
    store.dispatch('setFeatureInfoPosition', {
        position: FeatureInfoPositions.BOTTOMPANEL,
        ...dispatcher,
    })
}
</script>

<template>
    <CesiumPopover
        v-if="showFeaturesPopover"
        :coordinates="popoverCoordinates"
        :projection="projection"
        authorize-print
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
        <FeatureEdit v-if="editFeature" :read-only="true" :feature="editFeature" />
        <FeatureList />
    </CesiumPopover>
</template>
