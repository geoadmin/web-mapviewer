<template>
    <div
        ref="menuLayerItem"
        class="menu-layer-item"
        :class="{ compact: compact }"
        :data-cy="`menu-active-layer-${id}`"
    >
        <div class="menu-layer-item-title">
            <button
                class="btn d-flex align-items-center"
                :class="{ 'btn-lg': !compact }"
                :data-cy="`button-remove-layer-${id}`"
                @click="onRemoveLayer"
            >
                <FontAwesomeIcon icon="times-circle" />
            </button>
            <button
                class="btn d-flex align-items-center"
                :class="{ 'btn-lg': !compact }"
                :data-cy="`button-toggle-visibility-layer-${id}`"
                @click="onToggleLayerVisibility"
            >
                <FontAwesomeIcon :icon="`far fa-${layer.visible ? 'check-' : ''}square`" />
            </button>
            <TextTruncate
                class="menu-layer-item-name"
                :class="{ 'text-body-tertiary fst-italic': showSpinner }"
                :data-cy="`active-layer-name-${id}`"
                @click="onToggleLayerVisibility"
                >{{ layer.name }}</TextTruncate
            >
            <button
                v-if="showSpinner"
                class="loading-button btn"
                :class="{
                    'btn-lg': !compact,
                }"
                :data-cy="`button-loading-metadata-spinner-${id}`"
            >
                <FontAwesomeIcon icon="spinner" pulse />
            </button>
            <ErrorButton
                v-else-if="layer.hasError"
                :compact="compact"
                :error-message="layer.errorKey"
                :data-cy="`button-error-${id}`"
            />
            <MenuActiveLayersListItemTimeSelector
                v-if="layer.timeConfig"
                :layer-id="id"
                :time-config="layer.timeConfig"
                :compact="compact"
            />
            <ThirdPartDisclaimer
                v-if="hasDataDisclaimer(layer.getID())"
                :complete-disclaimer-on-click="true"
                :source-name="attributionName"
            >
                <FontAwesomeIcon
                    ref="tooltipAnchor"
                    class="data-disclaimer-tooltip text-primary p-2"
                    icon="user"
                    data-cy="menu-external-disclaimer-icon"
                />
            </ThirdPartDisclaimer>
            <button
                class="btn"
                :class="{
                    'btn-lg': !compact,
                    'flip text-primary': showDetails,
                }"
                :data-cy="`button-open-visible-layer-settings-${id}`"
                @click="onToggleLayerDetails"
            >
                <FontAwesomeIcon icon="cog" />
            </button>
        </div>
        <div
            v-show="showDetails"
            class="menu-layer-item-details"
            :data-cy="`div-layer-settings-${id}`"
        >
            <label :for="`transparency-${id}`" class="menu-layer-transparency-title">
                {{ $t('transparency') }}
            </label>
            <input
                :id="`transparency-${id}`"
                class="menu-layer-transparency-slider"
                type="range"
                min="0.0"
                max="1.0"
                step="0.01"
                :value="layer.opacity"
                :data-cy="`slider-opacity-layer-${id}`"
                @change="onOpacityChange"
            />
            <button
                class="btn d-flex align-items-center"
                :class="{ 'btn-lg': !compact }"
                :disabled="isFirstLayer"
                :data-cy="`button-raise-order-layer-${id}`"
                @click="onOrderChange(1)"
            >
                <FontAwesomeIcon icon="arrow-up" />
            </button>
            <button
                class="btn d-flex align-items-center"
                :class="{ 'btn-lg': !compact }"
                :disabled="isLastLayer"
                :data-cy="`button-lower-order-layer-${id}`"
                @click="onOrderChange(-1)"
            >
                <FontAwesomeIcon icon="arrow-down" />
            </button>
            <button
                v-if="showLegendIcon"
                class="btn d-flex align-items-center"
                :class="{ 'btn-lg': !compact }"
                :data-cy="`button-show-legend-layer-${id}`"
                @click="showLayerLegendPopup"
            >
                <FontAwesomeIcon icon="info-circle" />
            </button>
        </div>
    </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import tippy from 'tippy.js'
import { mapGetters, mapState } from 'vuex'

import AbstractLayer from '@/api/layers/AbstractLayer.class'
import MenuActiveLayersListItemTimeSelector from '@/modules/menu/components/activeLayers/MenuActiveLayersListItemTimeSelector.vue'
import ErrorButton from '@/utils/components/ErrorButton.vue'
import TextTruncate from '@/utils/components/TextTruncate.vue'
import ThirdPartDisclaimer from '@/utils/components/ThirdPartDisclaimer.vue'

/**
 * Representation of an active layer in the menu, with the name of the layer and some controls (like
 * visibility, opacity or position in the layer stack)
 */
export default {
    components: {
        FontAwesomeIcon,
        MenuActiveLayersListItemTimeSelector,
        ThirdPartDisclaimer,
        ErrorButton,
        TextTruncate,
    },
    props: {
        layer: {
            type: AbstractLayer,
            required: true,
        },
        showDetails: {
            type: Boolean,
            default: false,
        },
        isFirstLayer: {
            type: Boolean,
            default: false,
        },
        isLastLayer: {
            type: Boolean,
            default: false,
        },
        compact: {
            type: Boolean,
            default: false,
        },
    },
    emits: [
        'toggleLayerDetails',
        'removeLayer',
        'toggleLayerVisibility',
        'opacityChange',
        'orderChange',
        'showLayerLegendPopup',
    ],
    data() {
        return {
            showDataDisclaimer: false,
        }
    },
    computed: {
        ...mapGetters(['hasDataDisclaimer']),
        ...mapState({
            lang: (state) => state.i18n.lang,
        }),
        id() {
            return this.layer?.getID()
        },
        attributionName() {
            return this.layer.attributions.map((attribution) => attribution.name).join(', ')
        },
        checkboxIcon() {
            if (this.layer.visible) {
                return 'check-square'
            }
            return 'square'
        },
        showLegendIcon() {
            if (this.layer !== null) {
                return this.layer.hasLegend
            }
            return false
        },
        tooltipContent() {
            return this.$t('loading_external_layer')
        },
        showSpinner() {
            // only show the spinner for external layer, for our layers the
            // backend should be quick enough and don't require any spinner
            return this.layer.isLoading && this.layer.isExternal && !this.layer.hasError
        },
    },
    watch: {
        currentLang() {
            this.tippyInstance.setContent(this.tooltipContent)
        },
    },
    mounted() {
        this.tippyInstances = tippy('.loading-button', {
            content: this.tooltipContent,
            arrow: true,
            placement: 'top',
            touch: false,
        })
    },
    beforeUnmount() {
        this.tippyInstances?.forEach((instance) => {
            instance.destroy()
        })
    },
    methods: {
        onToggleLayerDetails() {
            this.$emit('toggleLayerDetails', this.id)
        },
        onRemoveLayer() {
            this.$emit('removeLayer', this.id)
        },
        onToggleLayerVisibility() {
            this.$emit('toggleLayerVisibility', this.id)
        },
        onOpacityChange(e) {
            this.$emit('opacityChange', this.id, e.target.value)
        },
        onOrderChange(delta) {
            this.$emit('orderChange', this.id, delta)
        },
        showLayerLegendPopup() {
            this.$emit('showLayerLegendPopup', this.id)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
@import 'src/modules/menu/scss/menu-items';

.data-disclaimer-tooltip {
    cursor: pointer;
}

.menu-layer-item {
    @extend .menu-item;
    border-bottom: 1px solid $gray-400;
}
.menu-layer-item-title {
    @extend .menu-title;
}
.menu-layer-item-name {
    @extend .menu-name;
    cursor: pointer;
}
.menu-layer-item-details {
    @extend .menu-title;
    padding-bottom: 0.4rem;
}
.menu-layer-transparency-title {
    font-size: 0.9em;
}
.menu-layer-transparency-slider {
    display: flex;
    flex-grow: 1;
    cursor: pointer;
}

svg {
    transition:
        transform 0.2s,
        color 0.2s;
    .flip & {
        transform: rotate(180deg);
    }
}

.loading-button {
    cursor: default;
}
</style>
