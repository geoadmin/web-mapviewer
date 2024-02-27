<script setup>
import DOMPurify from 'dompurify'
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import SelectableFeature from '@/api/features/SelectableFeature.class.js'
import CoordinateCopySlot from '@/utils/components/CoordinateCopySlot.vue'
import { LV95Format } from '@/utils/coordinates/coordinateFormat'

const props = defineProps({
    feature: {
        type: SelectableFeature,
        required: true,
    },
})

const { feature } = toRefs(props)

const i18n = useI18n()

const hasFeatureStringData = computed(() => typeof feature.value?.data === 'string')
const popupDataCanBeTrusted = computed(() => feature.value.popupDataCanBeTrusted)

const sanitizedFeatureDataEntries = computed(() => {
    if (hasFeatureStringData.value) {
        return []
    }
    return Object.entries(feature.value.data)
        .filter(([_, value]) => value)
        .map(([key, value]) => [key, sanitizeHtml(value)])
})
function sanitizeHtml(htmlText) {
    return DOMPurify.sanitize(htmlText)
}
</script>

<template>
    <!-- eslint-disable-next-line vue/no-v-html-->
    <div v-if="hasFeatureStringData && popupDataCanBeTrusted" v-html="feature.data" />
    <!-- eslint-disable-next-line vue/no-v-html-->
    <div v-else-if="hasFeatureStringData" v-html="sanitizeHtml(feature.data)" />
    <div v-else class="htmlpopup-container">
        <div class="htmlpopup-header">{{ feature.layer.name }}</div>
        <div class="htmlpopup-content">
            <div v-for="[key, value] in sanitizedFeatureDataEntries" :key="key" class="mb-1">
                <div class="fw-bold">{{ i18n.t(key) }}</div>
                <!-- eslint-disable-next-line vue/no-v-html-->
                <div v-html="value"></div>
            </div>
            <div v-if="sanitizedFeatureDataEntries.length === 0">
                {{ i18n.t('no_more_information') }}
            </div>
        </div>
        <div
            v-if="feature.geometry.type == 'Point'"
            class="d-flex pb-2 px-2 gap-1 justify-content-start align-items-center"
        >
            <CoordinateCopySlot
                class="d-flex"
                identifier="feature-detail-coordinate-copy"
                :value="LV95Format.format(feature.geometry.coordinates.slice(0, 2))"
            >
                <FontAwesomeIcon class="d-flex" icon="fas fa-map-marker-alt" />
            </CoordinateCopySlot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/variables-admin.module';

// Styling for external HTML content
:global(.htmlpopup-container) {
    width: 100%;
    font-size: 11px;
    text-align: start;
}
:global(.htmlpopup-header) {
    background-color: $gainsboro;
    padding: 7px;
    margin-bottom: 7px;
    font-weight: 700;
}
:global(.htmlpopup-content) {
    padding: 7px;
}
</style>
