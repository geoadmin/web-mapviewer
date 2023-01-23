<template>
    <div class="map-footer-attribution" data-cy="layers-copyrights">
        <span v-if="sources.length > 0">{{ $t('copyright_data') }}</span>
        <template v-for="(source, index) in sources" :key="source.name">
            <a
                v-if="source.url"
                :href="source.url"
                target="_blank"
                class="map-footer-attribution-source"
                :class="{ 'external-source': hasExternalDisclaimer(source) }"
                :data-cy="`layer-copyright-${source.name}`"
            >
                {{ getAttributionWithComaIfNeeded(source.name, index) }}
            </a>
            <span
                v-else
                class="map-footer-attribution-source"
                :class="{ 'external-source': hasExternalDisclaimer(source) }"
                :data-cy="`layer-copyright-${source.name}`"
            >
                {{ getAttributionWithComaIfNeeded(source.name, index) }}
            </span>
        </template>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import tippy from 'tippy.js'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import log from '@/utils/logging'

export default {
    computed: {
        ...mapState({
            lang: (state) => state.i18n.lang,
        }),
        ...mapGetters(['visibleLayers', 'currentBackgroundLayer']),
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
                    // Only keeping one attribution of the same data owner.
                    .map((layer) => {
                        log.debug(`==map layer`, layer)
                        return layer.attributions.map((attribution) => {
                            return {
                                name: attribution.name,
                                url: attribution.url,
                                isExternal: layer.isExternal || layer.type === LayerTypes.KML,
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
    watch: {
        lang(lang) {
            this.externalDisclaimerTooltip?.forEach((instance) => {
                instance.setContent(this.getExternalDisclaimerPopupContent())
            })
        },
    },
    updated() {
        // We need to destroy and recreate the tippy tooltip on each update
        // otherwise when removing/adding the external layer (e.g. visibility toggle) the
        // tippy won't work anymore.
        this.externalDisclaimerTooltip?.forEach((instance) => {
            instance.destroy()
        })
        this.externalDisclaimerTooltip = tippy('.external-source', {
            content: this.getExternalDisclaimerPopupContent(),
            arrow: true,
            placement: 'top',
        })
    },
    unmount() {
        this.externalDisclaimerTooltip?.forEach((instance) => {
            instance.destroy()
        })
    },
    methods: {
        getAttributionWithComaIfNeeded(attribution, index) {
            return `${attribution}${index !== this.sources.length - 1 ? ',' : ''}`
        },
        getExternalDisclaimerPopupContent() {
            return this.$i18n.t('external_data_tooltip')
        },
        hasExternalDisclaimer(source) {
            log.debug(`====source`, source)
            return source.isExternal || source.type === LayerTypes.KML
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
            color: $primary;
        }
    }
}
</style>
