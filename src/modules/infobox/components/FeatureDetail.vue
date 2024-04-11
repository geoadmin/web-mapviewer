<script setup>
import DOMPurify from 'dompurify'
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import SelectableFeature from '@/api/features/SelectableFeature.class.js'
import FeatureAreaInfo from '@/modules/infobox/components/FeatureAreaInfo.vue'
import FeatureDetailDisclaimer from '@/modules/infobox/components/FeatureDetailDisclaimer.vue'
import CoordinateCopySlot from '@/utils/components/CoordinateCopySlot.vue'
import allFormats from '@/utils/coordinates/coordinateFormat'

const props = defineProps({
    feature: {
        type: SelectableFeature,
        required: true,
    },
})

const { feature } = toRefs(props)

const i18n = useI18n()

const store = useStore()
const hasFeatureStringData = computed(() => typeof feature.value?.data === 'string')
const popupDataCanBeTrusted = computed(() => feature.value.popupDataCanBeTrusted)

const coordinateFormat = computed(() => {
    return allFormats.find((format) => format.id === store.state.position.displayedFormatId) ?? null
})
const sanitizedFeatureDataEntries = computed(() => {
    if (hasFeatureStringData.value || !feature.value?.data) {
        return []
    }
    return Object.entries(feature.value.data)
        .filter(([_, value]) => value) // filtering out null values
        .map(([key, value]) => [key, sanitizeHtml(key, value)])
})
function sanitizeHtml(key, htmlText) {
    if (key == 'description') {
        return DOMPurify.sanitize(htmlText, { ADD_TAGS: ['iframe'] })
    } else {
        return DOMPurify.sanitize(htmlText)
    }
}

function iframeLinks(value) {
    const whitelisted_hosts = ['map.geo.admin.ch', 'test.map.geo.admin.ch']
    let parser = new DOMParser()
    let parsedIframe = parser.parseFromString(value, 'text/html')

    let urls = Array.from(parsedIframe.getElementsByTagName('iframe'))
    let externalUrls = []
    //create an additional list containing only the external urls for third party warning
    urls.forEach((frame, index) => {
        let host = new URL(frame.src).hostname
        urls[index] = host
        if (!whitelisted_hosts.includes(host)) {
            externalUrls.push(host)
        }
    })
    return { urls: urls, externalUrls: externalUrls }
}
</script>

<template>
    <!-- eslint-disable-next-line vue/no-v-html-->
    <div v-if="hasFeatureStringData && popupDataCanBeTrusted" v-html="feature.data" />
    <!-- eslint-disable-next-line vue/no-v-html-->
    <div v-else-if="hasFeatureStringData" v-html="sanitizeHtml(feature.data)" />
    <div v-else class="htmlpopup-container">
        <div class="htmlpopup-header">{{ feature.title }}</div>
        <div class="htmlpopup-content">
            <div v-for="[key, value] in sanitizedFeatureDataEntries" :key="key" class="mb-1">
                <div class="d-flex flex-wrap align-items-center fw-bold">
                    <div>{{ i18n.t(key) }}</div>
                    <FeatureDetailDisclaimer
                        :iframe-links="iframeLinks(value)"
                    ></FeatureDetailDisclaimer>
                </div>
                <!-- eslint-disable-next-line vue/no-v-html-->
                <div data-cy="feature-detail-description-content" v-html="value"></div>
            </div>
            <div v-if="sanitizedFeatureDataEntries.length === 0">
                {{ i18n.t('no_more_information') }}
            </div>
        </div>
        <div class="d-flex pb-2 px-2 gap-1 justify-content-start align-items-center">
            <FeatureAreaInfo
                v-if="feature.geometry?.type === 'Polygon'"
                :geometry="feature.geometry"
            />
            <CoordinateCopySlot
                v-if="feature.geometry?.type === 'Point'"
                identifier="feature-detail-coordinate-copy"
                :value="feature.geometry.coordinates.slice(0, 2)"
                :coordinate-format="coordinateFormat"
            >
                <FontAwesomeIcon class="small align-text-top" icon="fas fa-map-marker-alt" />
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
