<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import log from '@swissgeo/log'
import DOMPurify from 'dompurify'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { LayerFeature, SelectableFeature } from '@/api/features/types'
import type { CoordinateFormat } from '@/utils/coordinates/coordinateFormat'

import { BLOCKED_EXTENSIONS, WHITELISTED_HOSTNAMES } from '@/config/security.config'
import FeatureAreaInfo from '@/modules/infobox/components/FeatureAreaInfo.vue'
import FeatureDetailDisclaimer from '@/modules/infobox/components/FeatureDetailDisclaimer.vue'
import usePositionStore from '@/store/modules/position'
import CoordinateCopySlot from '@/utils/components/CoordinateCopySlot.vue'
import { allFormats } from '@/utils/coordinates/coordinateFormat'

const { feature } = defineProps<{
    feature: SelectableFeature
}>()

const { t } = useI18n()

const positionStore = usePositionStore()
const { displayFormat } = storeToRefs(positionStore)

const featureData = computed<Record<string, string> | string | undefined>(() => {
    if (feature.isEditable) {
        return
    }
    const layerFeature = feature as LayerFeature
    if (layerFeature.popupData) {
        return layerFeature.popupData
    }
    return layerFeature.data
})

const hasFeatureStringData = computed<boolean>(
    () => !!featureData.value && typeof featureData.value === 'string'
)

const popupDataCanBeTrusted = computed<boolean>(
    () => !feature.isEditable && Boolean((feature as LayerFeature).popupDataCanBeTrusted)
)

const coordinateFormat = computed<CoordinateFormat | undefined>(() => {
    const id = displayFormat.value?.id
    return allFormats.find((format) => format.id === id)
})

type SanitizedEntry = [key: string, value: string, externalIframeHosts: string[]]
const sanitizedFeatureDataEntries = computed<SanitizedEntry[]>(() => {
    if (hasFeatureStringData.value || feature.isEditable) {
        return []
    }
    if (!featureData.value) {
        return []
    }
    return Object.entries(featureData.value as Record<string, string>)
        .filter(([, value]) => Boolean(value))
        .map(([key, value]) => {
            const isDescription = key === 'description'
            const valueStr = String(value)
            return [
                key,
                sanitizeHtml(valueStr, isDescription),
                isDescription ? getIframeHosts(valueStr) : [],
            ] as SanitizedEntry
        })
})

function sanitizeHtml(htmlText: string, withIframe = false): string {
    const blockedExternalContentString = t('blocked_external_content')

    function handleNode(node: Element, attribute: string): void {
        try {
            const attr = node.getAttribute(attribute)
            if (!attr) {
                return
            }
            const url = new URL(attr)
            const ext = url.pathname.split('.').pop()?.toLowerCase()
            if (ext && BLOCKED_EXTENSIONS.includes(ext)) {
                node.outerHTML = blockedExternalContentString
            }
        } catch (error: unknown) {
            log.error(`Error while handling node for sanitizing HTML`, error as string)
            node.outerHTML = blockedExternalContentString
        }
    }

    // Hook typings are loose, use any for the node to avoid over-constraint
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DOMPurify.addHook('afterSanitizeAttributes', function (node: any) {
        if (node.tagName === 'A') {
            node.setAttribute('target', '_blank')
            node.setAttribute('rel', 'noopener noreferrer')
            handleNode(node as Element, 'href')
        }
        if (node.tagName === 'IFRAME') {
            handleNode(node as Element, 'src')
        }
    })

    const config = {
        ADD_TAGS: withIframe ? ['iframe'] : [],
        ALLOWED_URI_REGEXP: /^(https?|mailto|tel|sms):/i,
    }

    const response = DOMPurify.sanitize(htmlText, config)
    DOMPurify.removeHook('afterSanitizeAttributes')
    return response
}

function getIframeHosts(value: string): string[] {
    const parser = new DOMParser()
    const dom = parser.parseFromString(value, 'text/html')

    return Array.from(dom.getElementsByTagName('iframe'))
        .map((iframe) => {
            if (!iframe.src) {
                return null
            }
            try {
                return new URL(iframe.src).hostname
            } catch {
                log.error(`Invalid iframe source "${iframe.src}" - cannot get hostname`)
                return iframe.src
            }
        })
        .filter((host): host is string => Boolean(host) && !WHITELISTED_HOSTNAMES.includes(host!))
}
</script>

<template>
    <!-- eslint-disable vue/no-v-html-->
    <div
        v-if="hasFeatureStringData && popupDataCanBeTrusted"
        v-html="featureData"
    />
    <div
        v-else-if="hasFeatureStringData"
        v-html="sanitizeHtml(featureData as string)"
    />
    <!-- eslint-enable vue/no-v-html-->
    <div
        v-else
        class="htmlpopup-container"
        data-cy="feature-detail-htmlpopup-container"
    >
        <div class="htmlpopup-content">
            <div
                v-for="[key, value, externalIframeHosts] in sanitizedFeatureDataEntries"
                :key="key"
                class="mb-1"
            >
                <FeatureDetailDisclaimer
                    v-if="externalIframeHosts.length"
                    class="fw-bold mb-2"
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
                    v-html="t(value)"
                />
                <!-- eslint-enable vue/no-v-html-->
            </div>
            <div v-if="sanitizedFeatureDataEntries.length === 0">
                {{ t('no_more_information') }}
            </div>
        </div>
        <div class="d-flex justify-content-start align-items-center gap-1 px-2 pb-2">
            <FeatureAreaInfo
                v-if="feature.geometry?.type === 'Polygon'"
                :geometry="feature.geometry"
            />
            <CoordinateCopySlot
                v-if="feature.geometry?.type === 'Point'"
                identifier="feature-detail-coordinate-copy"
                :value="(feature.geometry.coordinates as number[]).slice(0, 2)"
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
:global(.htmlpopup-container .t_list) {
    width: 100%;
}
:global(.htmlpopup-container td) {
    vertical-align: top;
}
:global(.htmlpopup-container td.cell-left) {
    padding-right: 10px;
}
</style>
