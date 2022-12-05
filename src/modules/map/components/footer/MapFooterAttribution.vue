<template>
    <div class="map-footer-attribution" data-cy="layers-copyrights">
        <span v-if="sources.length > 0">{{ $t('copyright_data') }}</span>
        <template v-for="(source, index) in sources" :key="source.attributionName">
            <a
                v-if="source.attributionUrl"
                :href="source.attributionUrl"
                target="_blank"
                class="map-footer-attribution-source"
                :class="{ 'external-source': source.isExternal }"
                :data-cy="`layer-copyright-${source.attributionName}`"
            >
                {{ getAttributionWithComaIfNeeded(source.attributionName, index) }}
            </a>
            <span
                v-else
                class="map-footer-attribution-source"
                :class="{ 'external-source': source.isExternal }"
                :data-cy="`layer-copyright-${source.attributionName}`"
                @mouseover="setDisclaimerArrowPosition"
            >
                {{ getAttributionWithComaIfNeeded(source.attributionName, index) }}
            </span>
        </template>
        <teleport to="#main-component">
            <div class="external-source-disclaimer card text-white bg-danger">
                {{ $t('external_data_tooltip') }}
                <div ref="disclaimerPopoverArrow" class="disclaimer-popover-arrow" />
            </div>
        </teleport>
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
                        isExternal: !!layer.isExternal,
                    }))
            )
        },
    },
    methods: {
        getAttributionWithComaIfNeeded(attribution, index) {
            return `${attribution}${index !== this.sources.length - 1 ? ',' : ''}`
        },
        setDisclaimerArrowPosition(event) {
            const currentlyHoveredExternalSource = event.target
            this.$refs.disclaimerPopoverArrow.style.left = `${
                currentlyHoveredExternalSource.offsetLeft +
                currentlyHoveredExternalSource.offsetWidth / 4.0
            }px`
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
<style lang="scss">
// this needs to be unscoped as we are teleporting this part of the component elsewhere
.external-source-disclaimer {
    opacity: 0;
    display: none !important;
    position: absolute;
    bottom: 0;
    right: 0;

    & .disclaimer-popover-arrow {
        position: absolute;
        z-index: -1;
        content: '';
        bottom: -8px;
        border-style: solid;
        border-width: 0 10px 10px 10px;
        border-color: transparent transparent red transparent;
        transform: rotate(180deg);
        transition-duration: 0.3s;
        transition-property: transform;
    }
}
:has(.external-source:hover) .external-source-disclaimer {
    z-index: 10;
    opacity: 1;
    visibility: visible;
    transform: translate(0, calc(-100% - 1rem - 8px));
}
</style>
