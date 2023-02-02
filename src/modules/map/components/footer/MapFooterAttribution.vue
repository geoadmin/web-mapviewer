<template>
    <div class="map-footer-attribution" data-cy="layers-copyrights">
        <span v-if="sources.length > 0">{{ $t('copyright_data') }}</span>
        <template v-for="(source, index) in sources" :key="source.name">
            <a
                v-if="source.url"
                :id="`source-${source.id}`"
                :href="source.url"
                target="_blank"
                class="map-footer-attribution-source"
                :class="{ 'data-disclaimer': source.hasDataDisclaimer }"
                :data-cy="`layer-copyright-${source.name}`"
                @click="onSourceClick(source)"
            >
                {{ getAttributionWithComaIfNeeded(source.name, index) }}
            </a>
            <span
                v-else
                :id="`source-${source.id}`"
                class="map-footer-attribution-source"
                :class="{ 'data-disclaimer': source.hasDataDisclaimer }"
                :data-cy="`layer-copyright-${source.name}`"
                @click="onSourceClick(source)"
            >
                {{ getAttributionWithComaIfNeeded(source.name, index) }}
            </span>
        </template>
        <ModalWithBackdrop
            v-if="showDataDisclaimer"
            :title="$t('alert_title')"
            header-primary
            fluid
            @close="onCloseDataDisclaimer()"
        >
            {{ getDataDisclaimerContent }}
        </ModalWithBackdrop>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import tippy from 'tippy.js'

import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'

export default {
    components: { ModalWithBackdrop },
    data() {
        return { clickedSource: null }
    },
    computed: {
        ...mapState({
            lang: (state) => state.i18n.lang,
        }),
        ...mapGetters(['visibleLayers', 'currentBackgroundLayer', 'hasDataDisclaimer']),
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
        showDataDisclaimer() {
            return this.clickedSource?.hasDataDisclaimer
        },
        getDataDisclaimerTooltipContent() {
            return this.$i18n.t('external_data_tooltip')
        },
        getDataDisclaimerContent() {
            return this.$i18n
                .t('external_data_warning')
                .replace('--URL--', this.clickedSource?.name)
        },
    },
    watch: {
        lang() {
            this.updateDataDisclaimerTooltip()
        },
    },
    updated() {
        // We need to destroy and recreate the tippy tooltip on each update
        // otherwise when removing/adding the external layer (e.g. visibility toggle) the
        // tippy won't work anymore.
        this.updateDataDisclaimerTooltip()
    },
    unmount() {
        this.dataDisclaimerTooltip?.forEach((instance) => {
            instance.destroy()
        })
    },
    methods: {
        onSourceClick(source) {
            this.clickedSource = source
        },
        onCloseDataDisclaimer() {
            this.clickedSource = null
        },
        getAttributionWithComaIfNeeded(attribution, index) {
            return `${attribution}${index !== this.sources.length - 1 ? ',' : ''}`
        },
        updateDataDisclaimerTooltip() {
            this.dataDisclaimerTooltip?.forEach((instance) => {
                instance.destroy()
            })
            this.dataDisclaimerTooltip = tippy(`.data-disclaimer`, {
                theme: 'primary',
                content: this.getDataDisclaimerTooltipContent,
                arrow: true,
                placement: 'top',
                touch: false,
            })
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

    &-source {
        margin-left: 2px;
        color: $black;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
        &.data-disclaimer {
            color: $primary;
        }
    }
}
</style>
