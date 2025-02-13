<script setup>
import log from '@geoadmin/log'
import DOMPurify from 'dompurify'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import SelectableFeature from '@/api/features/SelectableFeature.class.js'
import { BLOCKED_EXTENSIONS, WHITELISTED_HOSTNAMES } from '@/config/security.config'
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

const { t } = useI18n()

const store = useStore()
const hasFeatureStringData = computed(() => typeof props.feature?.data === 'string')
const popupDataCanBeTrusted = computed(() => props.feature?.popupDataCanBeTrusted)

const coordinateFormat = computed(() => {
    return allFormats.find((format) => format.id === store.state.position.displayedFormatId) ?? null
})
const sanitizedFeatureDataEntries = computed(() => {
    if (hasFeatureStringData.value || !props.feature?.data) {
        return []
    }
    return Object.entries(props.feature?.data)
        .filter(([_, value]) => value) // Filtering out null values
        .map(([key, value]) => [
            key,
            sanitizeHtml(value, key === 'description'),
            key === 'description' ? getIframeHosts(value) : [],
        ])
})
function sanitizeHtml(htmlText, withIframe = false) {
    const blockedExternalContentString = t('blocked_external_content')

    // Replacing possibly malicious code with `blockedExternalContentString` instead of removing it
    function handleNode(node, attribute) {
        try {
            const url = new URL(node.getAttribute(attribute))
            const ext = url.pathname.split('.').pop().toLowerCase()
            if (BLOCKED_EXTENSIONS.includes(ext)) {
                node.outerHTML = blockedExternalContentString
                return true
            }
        } catch (error) {
            log.error(error)
            node.outerHTML = blockedExternalContentString
            return true
        }
        return false
    }

    DOMPurify.addHook('afterSanitizeAttributes', function (node) {
        // Check the A tag and add target="_blank" and rel="noopener noreferrer" to prevent tabnabbing
        if (node.tagName === 'A') {
            node.setAttribute('target', '_blank')
            node.setAttribute('rel', 'noopener noreferrer')
            if (handleNode(node, 'href')) return
        }
        // Check the IFRAME tag
        if (node.tagName === 'IFRAME') {
            if (handleNode(node, 'src')) return
        }
    })
    const config = {
        ADD_TAGS: withIframe ? ['iframe'] : [],
        ALLOWED_URI_REGEXP: /^(https?|mailto|tel):/i, // Blocks file://, javascript:
    }
    const response = DOMPurify.sanitize(htmlText, config)
    DOMPurify.removeHook('afterSanitizeAttributes')
    return response
}

function getIframeHosts(value) {
    const parser = new DOMParser()
    const dom = parser.parseFromString(value, 'text/html')

    return Array.from(dom.getElementsByTagName('iframe'))
        .map((iframe) => {
            if (!iframe.src) return null
            try {
                return new URL(iframe.src).hostname
            } catch {
                log.error(`Invalid iframe source "${iframe.src}" - cannot get hostname`)
                return iframe.src
            }
        })
        .filter((host) => host && !WHITELISTED_HOSTNAMES.includes(host))
}
</script>

<template>
    <!-- eslint-disable vue/no-v-html-->
    <div
        v-if="hasFeatureStringData && popupDataCanBeTrusted"
        v-html="feature.data"
    />
    <div
        v-else-if="hasFeatureStringData"
        v-html="sanitizeHtml(feature.data)"
    />
    <!-- eslint-enable vue/no-v-html-->
    <div
        v-else
        class="htmlpopup-container"
    >
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
                />
                <div
                    v-else
                    class="fw-bold"
                >
                    {{ t(key) }}
                </div>
                <!-- eslint-disable vue/no-v-html-->
                <div
                    data-cy="feature-detail-description-content"
                    v-html="value"
                />
                <!-- eslint-enable vue/no-v-html-->
            </div>
            <div v-if="sanitizedFeatureDataEntries.length === 0">
                {{ t('no_more_information') }}
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
                <FontAwesomeIcon
                    class="small align-text-top"
                    icon="fas fa-map-marker-alt"
                />
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
// fix for layer HTML containing table, such as ch.bafu.gefahren-aktuelle_erdbeben
:global(.t_list) {
    width: 100%;
}
td {
    vertical-align: top;
}

td.cell-left {
    padding-right: 10px;
}
</style>
