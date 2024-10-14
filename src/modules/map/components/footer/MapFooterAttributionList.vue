<template>
    <div class="map-footer-attribution" data-cy="layers-copyrights">
        <span v-if="sources.length > 0">{{ $t('copyright_data') }}</span>
        <div v-for="(source, index) in sources" :key="source.name" class="d-inline-flex">
            <ThirdPartyDisclaimer
                v-if="source.hasDataDisclaimer"
                :source-name="source.name"
                :complete-disclaimer-on-click="!source.url"
                :is-external-data-local="source.isExternalDataLocal"
            >
                <MapFooterAttributionItem
                    :source-id="source.id"
                    :source-name="source.name"
                    :source-url="source.url"
                    :has-data-disclaimer="true"
                    :is-last="index === sources.length - 1"
                ></MapFooterAttributionItem>
            </ThirdPartyDisclaimer>
            <MapFooterAttributionItem
                v-else
                :source-id="source.id"
                :source-name="source.name"
                :source-url="source.url"
                :has-data-disclaimer="false"
                :is-last="index === sources.length - 1"
            ></MapFooterAttributionItem>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import MapFooterAttributionItem from '@/modules/map/components/footer/MapFooterAttributionItem.vue'
import ThirdPartyDisclaimer from '@/utils/components/ThirdPartyDisclaimer.vue'

export default {
    components: { MapFooterAttributionItem, ThirdPartyDisclaimer },
    computed: {
        ...mapState({
            layersConfig: (state) => state.layers.config,
        }),
        ...mapGetters([
            'visibleLayers',
            'hasDataDisclaimer',
            'isLocalFile',
            'currentBackgroundLayer',
        ]),
        layers() {
            const layers = []
            // when the background is void, we receive `undefined` here
            if (this.currentBackgroundLayer) {
                layers.push(this.currentBackgroundLayer)
            }
            layers.push(...this.visibleLayers)
            return layers
        },
        sources() {
            return (
                this.layers
                    // Discard layers without attribution. (eg. drawing layer)
                    .filter((layer) => layer.attributions.length > 0)
                    .map((layer) => {
                        return layer.attributions.map((attribution) => {
                            return {
                                id: attribution.name.replace(/[._]/g, '-'),
                                name: attribution.name,
                                url: attribution.url,
                                hasDataDisclaimer: this.hasDataDisclaimer(
                                    layer.id,
                                    layer.isExternal,
                                    layer.baseUrl
                                ),
                                isExternalDataLocal: this.isLocalFile(layer),
                            }
                        })
                    })
                    .flat()
                    .filter((attribution, index, array) => {
                        const firstIndex = array.findIndex((item) => item.name === attribution.name)
                        return index === firstIndex
                    })
            )
        },
    },
}
</script>

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
