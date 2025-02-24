<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import MapFooterAttributionItem from '@/modules/map/components/footer/MapFooterAttributionItem.vue'
import ThirdPartyDisclaimer from '@/utils/components/ThirdPartyDisclaimer.vue'

const store = useStore()
const { t } = useI18n()

const visibleLayers = computed(() => store.getters.visibleLayers)
const currentBackgroundLayer = computed(() => store.getters.currentBackgroundLayer)

const layers = computed(() => {
    const layersWithAttributions = []
    // when the background is void, we receive `undefined` here
    if (currentBackgroundLayer.value) {
        layersWithAttributions.push(currentBackgroundLayer.value)
    }
    layersWithAttributions.push(
        ...visibleLayers.value.filter((layer) => layer.attributions.length > 0)
    )
    return layersWithAttributions
})

const sources = computed(() => {
    return layers.value
        .map((layer) => {
            return layer.attributions.map((attribution) => {
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
        .flat()
        .filter((attribution, index, array) => {
            const firstIndex = array.findIndex((item) => item.name === attribution.name)
            return index === firstIndex
        })
})
</script>

<template>
    <div
        class="map-footer-attribution"
        data-cy="layers-copyrights"
    >
        <span v-if="sources.length > 0">{{ t('copyright_data') }}</span>
        <div
            v-for="(source, index) in sources"
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
                    :source-id="source.id"
                    :source-name="source.name"
                    :source-url="source.url"
                    :has-data-disclaimer="true"
                    :is-last="index === sources.length - 1"
                />
            </ThirdPartyDisclaimer>
            <MapFooterAttributionItem
                v-else
                :source-id="source.id"
                :source-name="source.name"
                :source-url="source.url"
                :has-data-disclaimer="false"
                :is-last="index === sources.length - 1"
            />
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
}
</style>
