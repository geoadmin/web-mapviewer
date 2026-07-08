<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import MapFooterAttributionItem from '@/modules/map/components/footer/MapFooterAttributionItem.vue'
import ThirdPartyDisclaimer from '@/utils/components/ThirdPartyDisclaimer.vue'

const store = useStore()
const { t } = useI18n()
const VISIBLE_SOURCE_COUNT = 4
const isExpanded = ref(false)

const visibleLayers = computed(() => store.getters.visibleLayers)
const currentBackgroundLayer = computed(() => store.getters.currentBackgroundLayer)

const layers = computed(() => {
    const layersWithAttributions = []
    // when the background is void, we receive `undefined` here
    if (currentBackgroundLayer.value) {
        layersWithAttributions.push(currentBackgroundLayer.value)
    }
    layersWithAttributions.push(
        ...visibleLayers.value.filter((layer) => (layer.attributions ?? []).length > 0)
    )
    return layersWithAttributions
})

const sources = computed(() => {
    return layers.value
        .flatMap((layer) => {
            const isLocalFile = store.getters.isLocalFile(layer)
            return (layer.attributions ?? []).map((attribution) => {
                return {
                    id: attribution.name.replace(/[._]/g, '-'),
                    name: attribution.name,
                    url: attribution.url,
                    hasDataDisclaimer: store.getters.hasDataDisclaimer(
                        layer.id,
                        layer.isExternal,
                        layer.baseUrl
                    ),
                    isLocalFile,
                    isTruncated: isLocalFile,
                }
            })
        })
        .filter((attribution, index, array) => {
            const firstIndex = array.findIndex((item) => item.name === attribution.name)
            return index === firstIndex
        })
})

const primarySources = computed(() => sources.value.filter((source) => !source.isLocalFile))
const localSources = computed(() => sources.value.filter((source) => source.isLocalFile))
const orderedSources = computed(() => [...primarySources.value, ...localSources.value])
const isCompact = computed(() => orderedSources.value.length > VISIBLE_SOURCE_COUNT)
const hiddenSourceCount = computed(() =>
    isCompact.value ? orderedSources.value.length - VISIBLE_SOURCE_COUNT : 0
)
const inlineSources = computed(() => orderedSources.value.slice(0, VISIBLE_SOURCE_COUNT))
const expandedSources = computed(() => orderedSources.value.slice(VISIBLE_SOURCE_COUNT))
const toggleButtonText = computed(() => (isExpanded.value ? '-' : `+${hiddenSourceCount.value}`))

const expandButtonLabel = computed(() => {
    if (isExpanded.value) {
        return t('attribution_overflow_hide_sources')
    }
    return t(
        hiddenSourceCount.value === 1
            ? 'attribution_overflow_show_source'
            : 'attribution_overflow_show_sources',
        { count: hiddenSourceCount.value }
    )
})

function closeExpanded() {
    isExpanded.value = false
}

function toggleExpanded() {
    isExpanded.value = !isExpanded.value
}
</script>

<template>
    <div
        v-click-outside="closeExpanded"
        class="map-footer-attribution d-inline-flex align-items-center flex-wrap"
        data-cy="layers-copyrights"
    >
        <span v-if="sources.length > 0">{{ t('copyright_data') }}</span>
        <div
            v-for="(source, index) in inlineSources"
            :key="source.name"
            class="d-inline-flex"
        >
            <ThirdPartyDisclaimer
                v-if="source.hasDataDisclaimer"
                :source-name="source.name"
                :complete-disclaimer-on-click="!source.url"
                :is-local-file="source.isLocalFile"
            >
                <MapFooterAttributionItem
                    :source-id="`${source.id}-${index}`"
                    :source-name="source.name"
                    :source-url="source.url"
                    :has-data-disclaimer="true"
                    :is-last="!isCompact && index === inlineSources.length - 1"
                    :is-truncated="source.isTruncated"
                />
            </ThirdPartyDisclaimer>
            <MapFooterAttributionItem
                v-else
                :source-id="`${source.id}-${index}`"
                :source-name="source.name"
                :source-url="source.url"
                :has-data-disclaimer="false"
                :is-last="!isCompact && index === inlineSources.length - 1"
                :is-truncated="source.isTruncated"
            />
        </div>
        <button
            v-if="isCompact"
            type="button"
            class="map-footer-attribution-toggle btn btn-light btn-sm ms-1 border px-1 py-0"
            data-cy="attribution-expand-toggle"
            :title="expandButtonLabel"
            @click="toggleExpanded"
        >
            {{ toggleButtonText }}
        </button>
        <div
            v-if="isCompact && isExpanded"
            class="map-footer-attribution-expanded-list position-absolute d-flex flex-column end-0 gap-1 overflow-y-auto rounded border bg-white p-2 text-start text-wrap shadow-sm"
            data-cy="attribution-expanded-list"
        >
            <div
                v-for="(source, index) in expandedSources"
                :key="source.name"
                class="d-flex lh-base"
            >
                <ThirdPartyDisclaimer
                    v-if="source.hasDataDisclaimer"
                    :source-name="source.name"
                    :complete-disclaimer-on-click="!source.url"
                    :is-local-file="source.isLocalFile"
                >
                    <MapFooterAttributionItem
                        :source-id="`${source.id}-expanded-${index}`"
                        :source-name="source.name"
                        :source-url="source.url"
                        :has-data-disclaimer="true"
                        :is-last="true"
                        :is-truncated="source.isTruncated"
                    />
                </ThirdPartyDisclaimer>
                <MapFooterAttributionItem
                    v-else
                    :source-id="`${source.id}-expanded-${index}`"
                    :source-name="source.name"
                    :source-url="source.url"
                    :has-data-disclaimer="false"
                    :is-last="true"
                    :is-truncated="source.isTruncated"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.map-footer-attribution {
    padding: 0.2em 0.6em;
    background: rgba($white, 0.7);
    font-size: 0.7rem;
    text-align: center;
    position: relative;
    pointer-events: all;
    max-width: calc(100vw - 0.5rem);
}

.map-footer-attribution-toggle {
    font-size: inherit;
    line-height: 1.2;
}

.map-footer-attribution-expanded-list {
    bottom: calc(100% + 0.25rem);
    z-index: $zindex-desktop-footer-infobox;
    max-width: min(24rem, calc(100vw - 1rem));
    max-height: 30vh;
}
</style>
