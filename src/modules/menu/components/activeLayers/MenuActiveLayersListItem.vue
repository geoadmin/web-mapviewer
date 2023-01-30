<template>
    <div
        ref="menuLayerItem"
        class="menu-layer-item"
        :class="{ compact: compact }"
        :data-cy="`menu-active-layer-${id}`"
    >
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
                :data-cy="`active-layer-name${id}`"
                @click="onToggleLayerVisibility"
                >{{ layer.name }}</span
            >
            <MenuActiveLayersListItemTimeSelector
                v-if="layer.timeConfig"
                :data-cy="`time-selector-${id}`"
                :time-config="layer.timeConfig"
                :compact="compact"
                @timestamp-change="onTimestampChange"
            />
            <FontAwesomeIcon
                v-if="hasDataDisclaimer(layer.getID())"
                class="data-disclaimer-tooltip text-primary p-2"
                icon="user"
                data-cy="menu-external-disclaimer-icon"
                @click="onDataDisclaimerClick()"
            />
            <ButtonWithIcon
                :button-font-awesome-icon="['fas', 'cog']"
                class="menu-layer-item-details-toggle"
                :class="{ 'text-primary': showDetails, flip: showLayerDetails }"
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
                :value="layer.opacity"
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
        <ModalWithBackdrop
            v-if="showDataDisclaimer"
            :title="$t('alert_title')"
            header-primary
            fluid
            @close="onDataDisclaimerClose()"
        >
            {{ getDataDisclaimerContent }}
        </ModalWithBackdrop>
    </div>
</template>

<script>
import AbstractLayer from '@/api/layers/AbstractLayer.class'
import MenuActiveLayersListItemTimeSelector from '@/modules/menu/components/activeLayers/MenuActiveLayersListItemTimeSelector.vue'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'
import tippy from 'tippy.js'
import { mapGetters, mapState } from 'vuex'

/**
 * Representation of an active layer in the menu, with the name of the layer and some controls (like
 * visibility, opacity or position in the layer stack)
 */
export default {
    components: { ButtonWithIcon, MenuActiveLayersListItemTimeSelector, ModalWithBackdrop },
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
        'timestampChange',
    ],
    data() {
        return {
            showLayerDetails: false,
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
        clogTransformation() {
            const transformation = {
                rotate: 0,
            }
            if (this.showDetails) {
                transformation.rotate = 180
            }
            return transformation
        },
        getDataDisclaimerTooltipContent() {
            return this.$i18n.t('external_data_tooltip')
        },
        getDataDisclaimerContent() {
            return this.$i18n.t('external_data_warning').replace('--URL--', this.attributionName)
        },
    },
    watch: {
        compact(compact) {
            this.disclaimerPopup?.forEach((instance) => {
                instance.setProps({ placement: compact ? 'right' : 'bottom' })
            })
        },
        lang() {
            this.disclaimerPopup?.forEach((instance) => {
                instance.setContent(this.getDataDisclaimerTooltipContent)
            })
        },
    },
    mounted() {
        if (this.hasDataDisclaimer(this.layer.getID())) {
            this.disclaimerPopup = tippy(`.data-disclaimer-tooltip`, {
                theme: 'primary',
                content: this.getDataDisclaimerTooltipContent,
                arrow: true,
                placement: this.compact ? 'right' : 'bottom',
                touch: false,
            })
        }
    },
    beforeUnmount() {
        this.disclaimerPopup?.forEach((instance) => {
            instance.destroy()
        })
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
        onDataDisclaimerClick() {
            this.showDataDisclaimer = true
        },
        onDataDisclaimerClose() {
            this.showDataDisclaimer = false
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
