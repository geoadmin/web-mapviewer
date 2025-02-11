<script setup>
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { useStore } from 'vuex'

import FeatureElevationProfile from '@/modules/infobox/components/FeatureElevationProfile.vue'
import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import FeatureStyleEdit from '@/modules/infobox/components/styling/FeatureStyleEdit.vue'

const { animation } = defineProps({
    animation: { type: Boolean, default: true },
})

const content = useTemplateRef('content')

const store = useStore()

const selectedFeatures = computed(() => store.getters.selectedFeatures)
const showFeatureInfoInBottomPanel = computed(() => store.getters.showFeatureInfoInBottomPanel)
const showDrawingOverlay = computed(() => store.state.drawing.drawingOverlay.show)

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
        class="infobox-content flex-column"
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
            <FeatureElevationProfile
                v-if="showElevationProfile"
                class="flex-grow-1"
                :animation="animation"
            />
        </div>
        <div
            v-else
            class="d-flex flex-column h-100 overflow-y-auto"
        >
            <div
                v-if="showElevationProfile"
                key="profile-detail"
                class="h-100 d-flex flex-column flex-md-row align-content-stretch"
            >
                <FeatureElevationProfile
                    class="flex-grow-1 profile-with-feature"
                    :animation="animation"
                />
            </div>
            <FeatureList
                v-if="showFeatureInfoInBottomPanel"
                v-show="!showElevationProfile"
            />
        </div>
    </div>
</template>
