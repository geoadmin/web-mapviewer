<template>
    <div class="map-footer-attribution" data-cy="layers-copyrights">
        <span v-if="sources.length > 0">{{ $t('copyright_data') }}</span>
        <template v-for="(source, index) in sources" :key="source.attributionName">
            <a
                v-if="source.attributionUrl"
                :href="source.attributionUrl"
                target="_blank"
                class="map-footer-attribution-source"
                :data-cy="`layer-copyright-${source.attributionName}`"
            >
                {{ getAttributionWithComaIfNeeded(source.attributionName, index) }}
            </a>
            <span
                v-else
                class="map-footer-attribution-source"
                :data-cy="`layer-copyright-${source.attributionName}`"
            >
                {{ getAttributionWithComaIfNeeded(source.attributionName, index) }}
            </span>
        </template>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    computed: {
        ...mapGetters(['visibleLayers', 'currentBackgroundLayer']),
        layers() {
            return [this.currentBackgroundLayer, ...this.visibleLayers].filter(Boolean)
        },
        sources() {
            return (
                this.layers
                    // Discard layers without attribution. (eg. drawing layer)
                    .filter((layer) => layer.attributionName)
                    // Only keeping one attribution of the same data owner.
                    .filter((layer, index, array) => {
                        const firstIndex = array.findIndex(
                            (item) => item.attributionName === layer.attributionName
                        )
                        return index === firstIndex
                    })
                    // Drop everything but the name and URL.
                    .map((layer) => ({
                        attributionName: layer.attributionName,
                        attributionUrl: layer.attributionUrl,
                    }))
            )
        },
    },
    methods: {
        getAttributionWithComaIfNeeded(attribution, index) {
            return `${attribution}${index !== this.sources.length - 1 ? ',' : ''}`
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

    &-source {
        margin-left: 2px;
        color: $black;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
}
</style>
