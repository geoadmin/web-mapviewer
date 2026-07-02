<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import MapFooterAttributionItem from '@/modules/map/components/footer/MapFooterAttributionItem.vue'
import ThirdPartyDisclaimer from '@/utils/components/ThirdPartyDisclaimer.vue'

const store = useStore()
const { t } = useI18n()
const COMPACT_SOURCE_COUNT = 3
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
                    isLocalFile: store.getters.isLocalFile(layer),
                }
            })
        })
        .filter((attribution, index, array) => {
            const firstIndex = array.findIndex((item) => item.name === attribution.name)
            return index === firstIndex
        })
})

const isCompact = computed(() => sources.value.length > COMPACT_SOURCE_COUNT)
const hiddenSourceCount = computed(() =>
    isCompact.value ? sources.value.length - COMPACT_SOURCE_COUNT : 0
)
const inlineSources = computed(() =>
    isCompact.value ? sources.value.slice(0, COMPACT_SOURCE_COUNT) : sources.value
)
const expandedSources = computed(() =>
    isCompact.value ? sources.value.slice(COMPACT_SOURCE_COUNT) : []
)
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
        class="map-footer-attribution"
        data-cy="layers-copyrights"
    >
        <span v-if="sources.length > 0">{{ t('copyright_data') }}</span>
        <div
            v-for="(source, index) in inlineSources"
            :key="source.name"
            class="map-footer-attribution-inline-item"
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
                />
            </ThirdPartyDisclaimer>
            <MapFooterAttributionItem
                v-else
                :source-id="`${source.id}-${index}`"
                :source-name="source.name"
                :source-url="source.url"
                :has-data-disclaimer="false"
                :is-last="!isCompact && index === inlineSources.length - 1"
            />
        </div>
        <button
            v-if="isCompact"
            type="button"
            class="map-footer-attribution-toggle"
            data-cy="attribution-expand-toggle"
            :title="expandButtonLabel"
            @click="toggleExpanded"
        >
            {{ toggleButtonText }}
        </button>
        <div
            v-if="isCompact"
            class="map-footer-attribution-expanded-list"
            :class="{ 'map-footer-attribution-expanded-list-hidden': !isExpanded }"
            data-cy="attribution-expanded-list"
        >
            <div
                v-for="(source, index) in expandedSources"
                :key="source.name"
                class="map-footer-attribution-expanded-item"
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
                    />
                </ThirdPartyDisclaimer>
                <MapFooterAttributionItem
                    v-else
                    :source-id="`${source.id}-expanded-${index}`"
                    :source-name="source.name"
                    :source-url="source.url"
                    :has-data-disclaimer="false"
                    :is-last="true"
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
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    max-width: calc(100vw - 0.5rem);
}

.map-footer-attribution-inline-item {
    display: inline-flex;
    min-width: 0;
}

.map-footer-attribution-toggle {
    margin-left: 2px;
    padding: 0 0.35rem;
    border: 1px solid rgba($black, 0.25);
    border-radius: 0.2rem;
    background: rgba($white, 0.85);
    color: $black;
    font: inherit;
    line-height: 1.2;

    &:hover {
        text-decoration: underline;
    }

    &:focus-visible {
        outline: 2px solid $primary;
        outline-offset: 2px;
    }
}

.map-footer-attribution-expanded-list {
    position: absolute;
    right: 0;
    bottom: calc(100% + 0.25rem);
    z-index: $zindex-desktop-footer-infobox;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    max-width: min(24rem, calc(100vw - 1rem));
    max-height: 30vh;
    padding: 0.4rem 0.6rem;
    overflow-y: auto;
    background: rgba($white, 0.97);
    border: 1px solid rgba($black, 0.15);
    border-radius: 0.2rem;
    box-shadow: 0 2px 6px rgba($black, 0.2);
    text-align: left;
    white-space: normal;
}

.map-footer-attribution-expanded-list-hidden {
    display: none;
}

.map-footer-attribution-expanded-item {
    display: flex;
    min-width: 0;
    line-height: 1.45;
}
</style>
