<template>
    <div class="menu-layer-item" :class="{ compact: compact }">
        <div class="menu-layer-item-title">
            <ButtonWithIcon
                :button-font-awesome-icon="['fas', 'times-circle']"
                :data-cy="`button-remove-layer-${id}`"
                :large="!compact"
                transparent
                @click="onRemoveLayer"
            />
            <ButtonWithIcon
                :button-font-awesome-icon="['far', checkboxIcon]"
                :data-cy="`button-toggle-visibility-layer-${id}`"
                :large="!compact"
                transparent
                @click="onToggleLayerVisibility"
            />
            <span
                class="menu-layer-item-name"
                :data-cy="`visible-layer-name-${id}`"
                @click="onToggleLayerVisibility"
                >{{ name }}</span
            >
            <MenuActiveLayersListItemTimeSelector
                v-if="timeConfig"
                :data-cy="`time-selector-${id}`"
                :time-config="timeConfig"
                :compact="compact"
                @timestamp-change="onTimestampChange"
            />
            <ButtonWithIcon
                :button-font-awesome-icon="['fas', 'cog']"
                class="menu-layer-item-details-toggle"
                :class="{ 'text-danger': showDetails, flip: showLayerDetails }"
                transparent
                :data-cy="`button-open-visible-layer-settings-${id}`"
                :large="!compact"
                @click="onToggleLayerDetails"
            />
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
                :value="opacity"
                :data-cy="`slider-opacity-layer-${id}`"
                @change="onOpacityChange"
            />
            <ButtonWithIcon
                :button-font-awesome-icon="['fas', 'arrow-up']"
                :disabled="isFirstLayer"
                :data-cy="`button-raise-order-layer-${id}`"
                :large="!compact"
                transparent
                @click="onOrderChange(1)"
            />
            <ButtonWithIcon
                :button-font-awesome-icon="['fas', 'arrow-down']"
                :disabled="isLastLayer"
                :data-cy="`button-lower-order-layer-${id}`"
                :large="!compact"
                transparent
                @click="onOrderChange(-1)"
            />
            <ButtonWithIcon
                :button-font-awesome-icon="['fas', 'info-circle']"
                :data-cy="`button-show-legend-layer-${id}`"
                :large="!compact"
                transparent
                @click="showLayerLegendPopup"
            />
        </div>
    </div>
</template>

<script>
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import MenuActiveLayersListItemTimeSelector from '@/modules/menu/components/activeLayers/MenuActiveLayersListItemTimeSelector.vue'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'

/**
 * Representation of an active layer in the menu, with the name of the layer and some controls (like
 * visibility, opacity or position in the layer stack)
 */
export default {
    components: { ButtonWithIcon, MenuActiveLayersListItemTimeSelector },
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
        'timestampChange',
    ],
    data() {
        return {
            showLayerDetails: false,
        }
    },
    computed: {
        checkboxIcon() {
            if (this.visible) {
                return 'check-square'
            }
            return 'square'
        },
        clogTransformation() {
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
        onToggleLayerDetails() {
            this.showLayerDetails = !this.showLayerDetails
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
        onTimestampChange(timestamp) {
            this.$emit('timestampChange', this.id, timestamp)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
@import 'src/modules/menu/scss/menu-items';

.menu-layer-item {
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
</style>
