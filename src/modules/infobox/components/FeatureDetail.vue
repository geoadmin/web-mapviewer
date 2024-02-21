<script setup>
import DOMPurify from 'dompurify'
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import SelectableFeature from '@/api/features/SelectableFeature.class.js'

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
    </div>
</template>
