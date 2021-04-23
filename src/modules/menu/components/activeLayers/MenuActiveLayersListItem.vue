<template>
    <div class="menu-layer-list-item">
        <div class="menu-list-item-title">
            <button
                class="btn btn-default"
                :data-cy="`button-remove-layer-${id}`"
                @click="onRemoveLayer"
            >
                <font-awesome-icon size="lg" :icon="['fas', 'times-circle']" />
            </button>
            <button
                class="btn btn-default"
                :data-cy="`button-toggle-visibility-layer-${id}`"
                @click="onToggleLayerVisibility"
            >
                <font-awesome-icon size="lg" :icon="['far', checkboxIcon]" />
            </button>
            <span
                class="menu-item-name"
                :data-cy="`visible-layer-name-${id}`"
                @click="onToggleLayerVisibility"
                >{{ name }}</span
            >
            <MenuActiveLayersListItemTimeSelector
                :data-cy="`time-selector-${id}`"
                :time-config="timeConfig"
                @timestampChange="onTimestampChange"
            />
            <button
                class="btn btn-default animate__animated animate__faster"
                :class="{ animate__pulse: showDetails }"
                :data-cy="`button-open-visible-layer-settings-${id}`"
                @click="onToggleLayerDetails"
            >
                <font-awesome-icon size="lg" :icon="['fas', 'cog']" />
            </button>
        </div>
        <div
            v-show="showDetails"
            class="menu-layer-list-item-details"
            :data-cy="`div-layer-settings-${id}`"
        >
            <div class="menu-layer-list-item-details-transparency">
                <span class="transparency-title">{{ $t('transparency') }}</span>
                <input
                    class="transparency-slider"
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.01"
                    :value="opacity"
                    :data-cy="`slider-opacity-layer-${id}`"
                    @change="onOpacityChange"
                />
            </div>
            <div class="menu-layer-list-item-details-order">
                <button
                    class="btn btn-default"
                    :data-cy="`button-raise-order-layer-${id}`"
                    @click="onOrderChange(1)"
                >
                    <font-awesome-icon size="lg" :icon="['fas', 'arrow-up']" />
                </button>
                <button
                    class="btn btn-default"
                    :data-cy="`button-lower-order-layer-${id}`"
                    @click="onOrderChange(-1)"
                >
                    <font-awesome-icon size="lg" :icon="['fas', 'arrow-down']" />
                </button>
                <button
                    class="btn btn-default"
                    :data-cy="`button-show-legend-layer-${id}`"
                    @click="showLayerLegendPopup"
                >
                    <font-awesome-icon size="lg" :icon="['fas', 'info-circle']" />
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
@import '../../scss/menu-items';
.menu-layer-list-item {
    @extend .menu-list-item;
    .menu-layer-list-item-details {
        border-left: 3px solid #666;
        .menu-layer-list-item-details-transparency {
            display: flex;
            flex-grow: 1;
            .transparency-title {
                font-size: 0.9rem;
            }
            .transparency-slider {
                display: flex;
                flex-grow: 1;
            }
        }
    }
}
</style>

<script>
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import MenuActiveLayersListItemTimeSelector from '@/modules/menu/components/activeLayers/MenuActiveLayersListItemTimeSelector'

/**
 * Representation of an active layer in the menu, with the name of the layer and some controls (like
 * visibility, opacity or position in the layer stack)
 */
export default {
    components: { MenuActiveLayersListItemTimeSelector },
    props: {
        id: {
            type: String,
            required: true,
        },
        visible: {
            type: Boolean,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        opacity: {
            type: Number,
            default: 1.0,
        },
        timeConfig: {
            type: LayerTimeConfig,
            default: null,
        },
        showDetails: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        checkboxIcon: function () {
            if (this.visible) {
                return 'check-square'
            }
            return 'square'
        },
        clogTransformation: function () {
            const transformation = {
                rotate: 0,
            }
            if (this.showDetails) {
                transformation.rotate = 180
            }
            return transformation
        },
    },
    methods: {
        onToggleLayerDetails: function () {
            this.$emit('toggleLayerDetails', this.id)
        },
        onRemoveLayer: function () {
            this.$emit('removeLayer', this.id)
        },
        onToggleLayerVisibility: function () {
            this.$emit('toggleLayerVisibility', this.id)
        },
        onOpacityChange: function (e) {
            this.$emit('opacityChange', this.id, e.target.value)
        },
        onOrderChange: function (delta) {
            this.$emit('orderChange', this.id, delta)
        },
        showLayerLegendPopup: function () {
            this.$emit('showLayerLegendPopup', this.id)
        },
        onTimestampChange: function (timestamp) {
            this.$emit('timestampChange', this.id, timestamp)
        },
    },
}
</script>
