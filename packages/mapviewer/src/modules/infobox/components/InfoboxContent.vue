<script setup>
import GeoadminElevationProfile from '@geoadmin/elevation-profile'
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { useStore } from 'vuex'

import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import FeatureStyleEdit from '@/modules/infobox/components/styling/FeatureStyleEdit.vue'

const content = useTemplateRef('content')

const store = useStore()

const selectedFeatures = computed(() => store.getters.selectedFeatures)
const showFeatureInfoInBottomPanel = computed(() => store.getters.showFeatureInfoInBottomPanel)
const showDrawingOverlay = computed(() => store.state.drawing.drawingOverlay.show)
const projection = computed(() => store.state.position.projection)
const currentLang = computed(() => store.state.i18n.lang)

const selectedFeature = computed(() => selectedFeatures.value[0])

const isSelectedFeatureEditable = computed(() => selectedFeature.value?.isEditable)
const isEditingDrawingFeature = computed(
    () => showDrawingOverlay.value && isSelectedFeatureEditable.value
)

const profileFeature = computed(() => store.state.features.profileFeature)
const showElevationProfile = computed(() => !!profileFeature.value)

watch(selectedFeatures, (features) => {
    if (features.length === 0) {
        return
    }
    nextTick(() => {
        content.value?.scrollTo(0, 0)
    })
})
</script>

<template>
    <div
        ref="content"
        class="infobox-content d-flex flex-column"
        data-cy="infobox-content"
    >
        <div
            v-if="isEditingDrawingFeature"
            class="drawing-feature d-flex flex-column flex-md-row"
        >
            <FeatureStyleEdit
                v-if="showFeatureInfoInBottomPanel"
                :feature="selectedFeature"
                class="drawing-feature-edit p-3"
                :class="{ 'flex-grow-1': !showElevationProfile }"
            />
            <GeoadminElevationProfile
                v-if="showElevationProfile"
                :points="selectedFeature.geometry.coordinates"
                :projection="projection.epsg"
                :locale="currentLang"
                class="flex-grow-1 position-relative"
            />
        </div>
        <div
            v-else
            class="d-flex flex-column h-100 overflow-y-auto infobox-content"
        >
            <div
                v-if="showElevationProfile"
                key="profile-detail"
                class="h-100 d-flex flex-column flex-md-row align-content-stretch infobox-content"
            >
                <GeoadminElevationProfile
                    :points="selectedFeature.geometry.coordinates"
                    :projection="projection.epsg"
                    :locale="currentLang"
                    class="flex-grow-1 profile-with-feature"
                />
            </div>
            <FeatureList
                v-if="showFeatureInfoInBottomPanel"
                v-show="!showElevationProfile"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.infobox-content {
    min-height: 200px;
    max-height: 25vh;
}
</style>
