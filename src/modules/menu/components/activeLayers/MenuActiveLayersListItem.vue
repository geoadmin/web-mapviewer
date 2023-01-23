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
                v-if="layer.isExternal"
                class="disclaimer-icon text-primary p-2"
                icon="user"
                data-cy="menu-external-disclaimer-icon"
            />
            <FontAwesomeIcon
                v-if="isKmlLayer"
                class="disclaimer-icon me-2"
                :class="{
                    'text-dark': isKmlEditable,
                    'text-primary': !isKmlEditable,
                    // 'external-kml-disclaimer': !isKmlEditable,
                    // 'editable-kml-disclaimer': isKmlEditable,
                }"
                :icon="kmlLayerIcon"
                data-cy="menu-kml-disclaimer-icon"
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
    </div>
</template>

<script>
import AbstractLayer from '@/api/layers/AbstractLayer.class'
import MenuActiveLayersListItemTimeSelector from '@/modules/menu/components/activeLayers/MenuActiveLayersListItemTimeSelector.vue'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import tippy from 'tippy.js'
import { mapState } from 'vuex'
import log from '@/utils/logging'

/**
 * Representation of an active layer in the menu, with the name of the layer and some controls (like
 * visibility, opacity or position in the layer stack)
 */
export default {
    components: { ButtonWithIcon, MenuActiveLayersListItemTimeSelector },
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
        }
    },
    computed: {
        ...mapState({
            lang: (state) => state.i18n.lang,
        }),
        id() {
            return this.layer?.getID()
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
        isKmlLayer() {
            return this.layer.type === LayerTypes.KML
        },
        kmlLayerIcon() {
            return this.layer.adminId ? 'user-pen' : 'user-lock'
        },
        isKmlEditable() {
            if (this.isKmlLayer) {
                return !!this.layer.adminId
            }
            return false
        },
    },
    watch: {
        compact(compact) {
            this.externalDisclaimerPopup?.forEach((instance) => {
                instance.setProps({ placement: compact ? 'right' : 'bottom' })
            })
        },
        lang(lang) {
            this.disclaimerPopup?.forEach((instance) => {
                instance.setContent(this.getDisclaimerPopupContent())
            })
        },
    },
    mounted() {
        this.disclaimerPopup = []
        if (this.layer.isExternal || this.isKmlLayer) {
            this.disclaimerPopup = tippy('.disclaimer-icon', {
                content: this.getDisclaimerPopupContent(),
                arrow: true,
                placement: this.compact ? 'right' : 'bottom',
                hideOnClick: false,
                trigger: 'mouseenter focus click',
                onShow: (instance) => {
                    log.debug(
                        `Show tippy: ${this.getDisclaimerPopupContent()}`,
                        instance,
                        this.layer
                    )
                    // for mobile (non-compact) we hide the tooltip after 5sec
                    if (!this.compact) {
                        setTimeout(() => {
                            instance.hide()
                        }, 5000)
                    }
                    // instance.setContent(this.getDisclaimerPopupContent())
                },
                onClickOutside: (instance, event) => {
                    // because on mobile we hide it after a 5 seconds timeout
                    // we need to hide it when click outside, e.g. click on close menu
                    instance.hide()
                },
            })
        }
    },
    beforeUnmount() {
        this.disclaimerPopup.forEach((instance) => {
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
        getDisclaimerPopupContent() {
            // if (this.isExternal) {
            return this.$i18n.t('external_data_tooltip')
            // } else if (this.isKmlLayer && this.layer.adminId) {
            //     return `KML Drawing can be edited by entering drawing menu`
            // } else if (this.isKmlLayer) {
            //     return `KML Drawing provided by third party`
            // }
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
