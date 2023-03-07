<template>
    <div class="map-footer-attribution" data-cy="layers-copyrights">
        <span v-if="sources.length > 0">{{ $t('copyright_data') }}</span>
        <div v-for="(source, index) in sources" :key="source.name" class="d-inline-flex">
            <ThirdPartDisclaimer
                v-if="source.hasDataDisclaimer"
                :source-name="source.name"
                :complete-disclaimer-on-click="!source.url"
            >
                <MapFooterAttributionItem
                    :source-id="source.id"
                    :source-name="source.name"
                    :source-url="source.url"
                    :has-data-disclaimer="true"
                    :is-last="index === sources.length - 1"
                ></MapFooterAttributionItem>
            </ThirdPartDisclaimer>
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
import { VECTOR_LIGHT_BASE_MAP_STYLE_ID } from '@/config'
import MapFooterAttributionItem from '@/modules/map/components/footer/MapFooterAttributionItem.vue'
import ThirdPartDisclaimer from '@/utils/ThirdPartDisclaimer.vue'
import { mapGetters, mapState } from 'vuex'

export default {
    components: { MapFooterAttributionItem, ThirdPartDisclaimer },
    computed: {
        ...mapState({
            layersConfig: (state) => state.layers.config,
        }),
        ...mapGetters([
            'visibleLayers',
            'currentBackgroundLayer',
            'hasDataDisclaimer',
            'isExtentOnlyWithinLV95Bounds',
        ]),
        layers() {
            const layers = []
            // when the background is void, we receive `undefined` here
            if (this.currentBackgroundLayer) {
                layers.push(this.currentBackgroundLayer)
            }
            /*
             Edge case that will be removed as soon as we have a proper VT pixelkarte layer.

             As we are showing LightBaseMap layer behind pixelkarte-farbe whenever we are not
             covering only Swiss grounds, we need to add the attribution of LightBaseMap depending
             on the current extent of the app
             */
            if (
                this.currentBackgroundLayer?.getID() === 'ch.swisstopo.pixelkarte-farbe' &&
                !this.isExtentOnlyWithinLV95Bounds
            ) {
                layers.push(
                    this.layersConfig.find(
                        (layer) => layer.getID() === VECTOR_LIGHT_BASE_MAP_STYLE_ID
                    )
                )
            }
            layers.push(...this.visibleLayers)
            return layers
        },
        sources() {
            return (
                this.layers
                    // Discard layers without attribution. (eg. drawing layer)
                    .filter((layer) => layer.attributions.length > 0)
                    // Only keeping one attribution of the same data owner.
                    .map((layer) => {
                        return layer.attributions.map((attribution) => {
                            return {
                                id: attribution.name.replace(/[._]/g, '-'),
                                name: attribution.name,
                                url: attribution.url,
                                hasDataDisclaimer: this.hasDataDisclaimer(layer.getID()),
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
@import 'src/scss/webmapviewer-bootstrap-theme';

.map-footer-attribution {
    padding: 0.2em 0.6em;
    background: rgba($white, 0.7);
    font-size: 0.7rem;
    text-align: center;
    position: relative;
    cursor: pointer;
}
</style>
