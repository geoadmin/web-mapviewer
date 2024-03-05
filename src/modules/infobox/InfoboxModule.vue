<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, nextTick, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { FeatureInfoPositions } from '@/store/modules/ui.store'
import promptUserToPrintHtmlContent from '@/utils/print'

import FeatureCombo from './components/FeatureCombo.vue'
import FeatureEdit from './components/FeatureEdit.vue'
import FeatureElevationProfile from './components/FeatureElevationProfile.vue'
import FeatureList from './components/FeatureList.vue'

const dispatcher = { dispatcher: 'InfoboxModule.vue' }
const showContent = ref(true)
const content = ref(null)
const store = useStore()

const selectedFeatures = computed(() => store.state.features.selectedFeatures)
const bottomPanelFeatureInfo = computed(() => store.getters.bottomPanelFeatureInfo)
const floatingPanelFeatureInfo = computed(() => store.getters.floatingPanelFeatureInfo)
const showDrawingOverlay = computed(() => store.state.ui.showDrawingOverlay)
const projection = computed(() => store.state.position.projection)

const selectedFeature = computed(() => selectedFeatures.value[0])

const isEdit = computed(() => selectedFeature.value?.isEditable)

const showElevationProfile = computed(() =>
    [EditableFeatureTypes.LINEPOLYGON, EditableFeatureTypes.MEASURE].includes(
        selectedFeature.value?.featureType
    )
)

const showContainer = computed(() => {
    return (
        selectedFeatures.value.length > 0 &&
        (bottomPanelFeatureInfo.value ||
            (showElevationProfile.value && floatingPanelFeatureInfo.value))
    )
})
const showFloatingToggle = computed(() => bottomPanelFeatureInfo.value)

watch(selectedFeatures, (features) => {
    if (features.length === 0) {
        return
    }
    showContent.value = true
    nextTick(() => {
        content.value.scrollTo(0, 0)
    })
})

function onToggleContent() {
    showContent.value = !showContent.value
}
function changeFeatureInfoPosition() {
    store.dispatch('setFeatureInfoPosition', {
        featureInfo: FeatureInfoPositions.FLOATING,
        ...dispatcher,
    })
}
function onPrint() {
    promptUserToPrintHtmlContent(content.value)
}
function onClose() {
    store.dispatch('clearAllSelectedFeatures', dispatcher)
}
</script>

<template>
    <div v-if="showContainer" class="infobox card rounded-0" data-cy="infobox" @contextmenu.stop>
        <div class="infobox-header card-header d-flex justify-content-end" data-cy="infobox-header">
            <button
                v-if="showFloatingToggle"
                class="btn btn-light btn-sm d-flex align-items-center"
                data-cy="infobox-toggle-floating"
                @click.stop="changeFeatureInfoPosition"
            >
                <FontAwesomeIcon icon="caret-up" />
            </button>
            <button class="btn btn-light btn-sm d-flex align-items-center" @click.stop="onPrint">
                <FontAwesomeIcon icon="print" />
            </button>
            <button
                class="btn btn-light btn-sm d-flex align-items-center"
                data-cy="infobox-minimize-maximize"
                @click="onToggleContent"
            >
                <FontAwesomeIcon v-if="!showContent" icon="window-maximize" />
                <FontAwesomeIcon v-if="showContent" icon="window-minimize" />
            </button>
            <button
                class="btn btn-light btn-sm d-flex align-items-center"
                data-cy="infobox-close"
                @click.stop="onClose"
            >
                <FontAwesomeIcon icon="times" />
            </button>
        </div>

        <div v-show="showContent" ref="content" class="infobox-content" data-cy="infobox-content">
            <FeatureElevationProfile
                v-if="floatingPanelFeatureInfo && showElevationProfile"
                class="card-body"
                :feature="selectedFeature"
                :read-only="!showDrawingOverlay"
                :projection="projection"
            />

            <FeatureCombo
                v-else-if="showElevationProfile"
                class="card-body"
                :feature="selectedFeature"
                :read-only="!showDrawingOverlay"
            />

            <FeatureEdit
                v-else-if="isEdit"
                class="card-body"
                :feature="selectedFeature"
                :read-only="!showDrawingOverlay"
            />

            <FeatureList v-else />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/variables';

.infobox {
    width: 100%;
}
</style>
