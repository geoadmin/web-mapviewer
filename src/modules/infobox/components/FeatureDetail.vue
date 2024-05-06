<script setup>
import DOMPurify from 'dompurify'
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import SelectableFeature from '@/api/features/SelectableFeature.class.js'
import { WHITELISTED_HOSTNAMES } from '@/config'
import FeatureAreaInfo from '@/modules/infobox/components/FeatureAreaInfo.vue'
import FeatureDetailDisclaimer from '@/modules/infobox/components/FeatureDetailDisclaimer.vue'
import CoordinateCopySlot from '@/utils/components/CoordinateCopySlot.vue'
import allFormats from '@/utils/coordinates/coordinateFormat'
import log from '@/utils/logging'

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
        .map(([key, value]) => [
            key,
            sanitizeHtml(value, key === 'description'),
            getIframeHosts(value),
        ])
})
function sanitizeHtml(htmlText, withIframe = false) {
    DOMPurify.addHook('afterSanitizeAttributes', function (node) {
        // set all elements owning target to target=_blank
        if ('target' in node) {
            node.setAttribute('target', '_blank')
            node.setAttribute('rel', 'noopener')
        }
    })
    let response = null
    if (withIframe) {
        response = DOMPurify.sanitize(htmlText, { ADD_TAGS: ['iframe'] })
    } else {
        response = DOMPurify.sanitize(htmlText)
    }
    DOMPurify.removeHook('afterSanitizeAttributes')
    return response
}

function getIframeHosts(value) {
    let parser = new DOMParser()
    let dom = parser.parseFromString(value, 'text/html')

    const hosts = Array.from(dom.getElementsByTagName('iframe')).map((iframe) => {
        try {
            return new URL(iframe.src).hostname
        } catch (error) {
            log.error(`Invalid iframe source "${iframe.src}" cannot get hostname`)
            return iframe.src
        }
    })
    return hosts.filter((host) => !WHITELISTED_HOSTNAMES.includes(host))
}
</script>

<template>
    <!-- eslint-disable-next-line vue/no-v-html-->
    <div v-if="hasFeatureStringData && popupDataCanBeTrusted" v-html="feature.data" />
    <!-- eslint-disable-next-line vue/no-v-html-->
    <div v-else-if="hasFeatureStringData" v-html="sanitizeHtml(feature.data)" />
    <div v-else class="htmlpopup-container">
        <div class="htmlpopup-content">
            <div
                v-for="[key, value, externalIframeHosts] in sanitizedFeatureDataEntries"
                :key="key"
                class="mb-1"
            >
                <FeatureDetailDisclaimer
                    v-if="externalIframeHosts.length"
                    class="mb-2 fw-bold"
                    :external-iframe-hosts="externalIframeHosts"
                    :title="key"
                ></FeatureDetailDisclaimer>
                <div v-else class="fw-bold">{{ i18n.t(key) }}</div>
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
@import '@/scss/variables-admin.module';

// Styling for external HTML content
:global(.htmlpopup-container) {
    width: 100%;
    font-size: 11px;
    text-align: start;
}
:global(.htmlpopup-header) {
    display: none;
}
:global(.htmlpopup-content) {
    padding: 7px;
}
</style>
