<template>
    <div class="map-footer-attribution" data-cy="layers-copyrights">
        <span v-if="sources.length > 0">{{ $t('copyright_data') }}</span>
        <template v-for="(source, index) in sources" :key="source.name">
            <a
                v-if="source.url"
                :href="source.url"
                target="_blank"
                class="map-footer-attribution-source"
                :class="{ 'external-source': source.isExternal }"
                :data-cy="`layer-copyright-${source.name}`"
            >
                {{ getAttributionWithComaIfNeeded(source.name, index) }}
            </a>
            <span
                v-else
                class="map-footer-attribution-source"
                :class="{ 'external-source': source.isExternal }"
                :data-cy="`layer-copyright-${source.name}`"
            >
                {{ getAttributionWithComaIfNeeded(source.name, index) }}
            </span>
        </template>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import tippy from 'tippy.js'

export default {
    computed: {
        ...mapGetters(['visibleLayers', 'currentBackgroundLayer']),
        layers() {
            return [this.currentBackgroundLayer, ...this.visibleLayers]
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
                                name: attribution.name,
                                url: attribution.url,
                                isExternal: layer.isExternal,
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
    mounted() {
        this.externalDisclaimerTooltip = tippy('.external-source', {
            content: this.$i18n.t('external_data_tooltip'),
            arrow: true,
            placement: 'top',
            theme: 'danger',
        })
    },
    beforeUnmount() {
        if (this.externalDisclaimerTooltip && this.externalDisclaimerTooltip.length > 1) {
            // there could be multiple instances of tippy as we are selecting based on a class name
            this.externalDisclaimerTooltip.forEach((instance) => {
                instance.destroy()
            })
        } else {
            this.externalDisclaimerTooltip?.destroy()
        }
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
    position: relative;

    &-source {
        margin-left: 2px;
        color: $black;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
        &.external-source {
            color: $red;
        }
    }
}
</style>
