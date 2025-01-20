<script setup>
/**
 * Representation of an active layer in the menu, with the name of the layer and some controls (like
 * visibility, opacity or position in the layer stack)
 */

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import log from '@geoadmin/log'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import AbstractLayer from '@/api/layers/AbstractLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { allKmlStyles } from '@/api/layers/KmlStyles.enum'
import MenuActiveLayersListItemTimeSelector from '@/modules/menu/components/activeLayers/MenuActiveLayersListItemTimeSelector.vue'
import DropdownButton from '@/utils/components/DropdownButton.vue'
import ErrorButton from '@/utils/components/ErrorButton.vue'
import TextTruncate from '@/utils/components/TextTruncate.vue'
import ThirdPartyDisclaimer from '@/utils/components/ThirdPartyDisclaimer.vue'
import WarningButton from '@/utils/components/WarningButton.vue'
import ZoomToExtentButton from '@/utils/components/ZoomToExtentButton.vue'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'
import debounce from '@/utils/debounce'

const dispatcher = { dispatcher: 'MenuActiveLayersListItem.vue' }

const { index, layer, showLayerDetail, focusMoveButton, isTopLayer, isBottomLayer, compact } =
    defineProps({
        index: {
            type: Number,
            required: true,
        },
        layer: {
            type: AbstractLayer,
            required: true,
        },
        showLayerDetail: {
            type: Boolean,
            default: false,
        },
        focusMoveButton: {
            type: [String, null],
            default: null,
        },
        isTopLayer: {
            type: Boolean,
            default: false,
        },
        isBottomLayer: {
            type: Boolean,
            default: false,
        },
        compact: {
            type: Boolean,
            default: false,
        },
    })

const emit = defineEmits(['showLayerDescriptionPopup', 'toggleLayerDetail', 'moveLayer'])

const store = useStore()
const { t } = useI18n()

const menuLayerItem = useTemplateRef('menuLayerItem')

const layerUpButton = useTemplateRef('layerUpButton')
const layerDownButton = useTemplateRef('layerDownButton')
const transparencySlider = useTemplateRef('transparencySlider')
const currentKmlStyle = ref(layer?.style ?? null)
const id = computed(() => layer.id)

/** @type {ComputedRef<DropdownItem[]>} */
const kmlStylesAsDropdownItems = computed(() =>
    allKmlStyles.map((style) => ({ id: style, title: style.toLowerCase(), value: style }))
)

const isLocalFile = computed(() => store.getters.isLocalFile(layer))
const hasDataDisclaimer = computed(() =>
    store.getters.hasDataDisclaimer(id.value, layer.isExternal, layer.baseUrl)
)
const attributionName = computed(() =>
    layer.attributions.map((attribution) => attribution.name).join(', ')
)
const showLayerDescriptionIcon = computed(() => layer.hasDescription)
const hasMultipleTimestamps = computed(() => layer.hasMultipleTimestamps)
const isPhoneMode = computed(() => store.getters.isPhoneMode)
const is3dActive = computed(() => store.state.cesium.active)

const isLayerKml = computed(() => layer instanceof KMLLayer)
const isLayerClampedToGround = computed({
    get: () => layer.clampToGround,
    set: (value) => {
        store.dispatch('updateLayer', {
            layerId: id.value,
            values: {
                clampToGround: value,
            },
            ...dispatcher,
        })
    },
})

// only show the spinner for external layer, for our layers the
// backend should be quick enough and don't require any spinner
const showSpinner = computed(() => layer.isLoading && layer.isExternal && !layer.hasError)

const loadingSpinner = useTemplateRef('loadingSpinner')
useTippyTooltip(loadingSpinner, 'loading_external_layer')

const duplicateLayerButton = useTemplateRef('duplicateLayerButton')
useTippyTooltip(duplicateLayerButton, 'duplicate_layer')

onMounted(() => {
    if (showLayerDetail) {
        if (focusMoveButton === 'up') {
            layerUpButton.value.focus()
        } else if (focusMoveButton === 'down') {
            layerDownButton.value.focus()
        }
    }
})

function onRemoveLayer() {
    store.dispatch('removeLayer', { index, ...dispatcher })
}

function onToggleLayerVisibility() {
    store.dispatch('toggleLayerVisibility', { index, ...dispatcher })
}

function dispatchOpacity(opacity) {
    if (layer.opacity.toFixed(2) !== opacity.toFixed(2)) {
        store.dispatch('setLayerOpacity', {
            index,
            opacity: opacity.toFixed(2),
            ...dispatcher,
        })
    }
}

function onTransparencyChange() {
    dispatchOpacity(1.0 - transparencySlider.value.value)
}

const debounceTransparencyChange = debounce(onTransparencyChange, 50)

function onTransparencyCommit() {
    log.info('[Menu Active Layers List Item component]: Committing last transparency reached')

    dispatchOpacity(1.0 - transparencySlider.value.value)
}

function showLayerDescriptionPopup() {
    emit('showLayerDescriptionPopup', id.value)
    //close menu on mobile only
    if (isPhoneMode.value) {
        store.dispatch('toggleMenu', dispatcher)
    }
}

function duplicateLayer() {
    store.dispatch('addLayer', { layer: layer.clone(), ...dispatcher })
}

function changeStyle(newStyle) {
    store.dispatch('updateLayer', {
        layerId: id.value,
        values: {
            style: newStyle.value,
        },
        ...dispatcher,
    })
    currentKmlStyle.value = newStyle.value
}
</script>

<template>
    <div
        ref="menuLayerItem"
        class="menu-layer-item"
        v-bind="$attrs"
        :class="{ compact: compact }"
        :data-cy="`menu-active-layer-${id}-${index}`"
    >
        <div class="menu-layer-item-title">
            <button
                class="btn border-0 d-flex align-items-center"
                :class="{ 'btn-lg': !compact }"
                :data-cy="`button-remove-layer-${id}-${index}`"
                @click="onRemoveLayer"
            >
                <FontAwesomeIcon icon="times-circle" />
            </button>
            <button
                class="btn border-0 d-flex align-items-center"
                :class="{ 'btn-lg': !compact }"
                :data-cy="`button-toggle-visibility-layer-${id}-${index}`"
                @click="onToggleLayerVisibility"
            >
                <FontAwesomeIcon :icon="`far fa-${layer.visible ? 'check-' : ''}square`" />
            </button>
            <TextTruncate
                class="menu-layer-item-name p-1"
                :class="{ 'text-body-tertiary fst-italic': showSpinner }"
                :data-cy="`active-layer-name-${id}-${index}`"
                :tippy-options="{ placement: isPhoneMode ? 'top' : 'right' }"
                @click="onToggleLayerVisibility"
            >
                {{ layer.name }}
            </TextTruncate>
            <ZoomToExtentButton
                v-if="layer.extent"
                :extent="layer.extent"
            />
            <button
                v-if="showSpinner"
                ref="loadingSpinner"
                class="loading-button btn border-0 d-flex align-items-center"
                :class="{
                    'btn-lg': !compact,
                }"
                :data-cy="`button-loading-metadata-spinner-${id}-${index}`"
            >
                <FontAwesomeIcon
                    icon="spinner"
                    pulse
                />
            </button>
            <ErrorButton
                v-else-if="layer.hasError"
                :compact="compact"
                :error-message="layer.getFirstErrorMessage()"
                :data-cy="`button-error-${id}-${index}`"
            />
            <WarningButton
                v-else-if="layer.hasWarning"
                :compact="compact"
                :warning-message="layer.getFirstWarningMessage()"
                :data-cy="`button-warning-${id}-${index}`"
            />
            <MenuActiveLayersListItemTimeSelector
                v-if="hasMultipleTimestamps"
                :layer-index="index"
                :layer-id="id"
                :time-config="layer.timeConfig"
                :compact="compact"
            />
            <ThirdPartyDisclaimer
                v-if="hasDataDisclaimer"
                :complete-disclaimer-on-click="true"
                :source-name="attributionName"
                :is-local-file="isLocalFile"
            >
                <FontAwesomeIcon
                    v-if="!isLocalFile"
                    class="data-disclaimer-tooltip text-primary"
                    icon="cloud"
                    data-cy="menu-external-disclaimer-icon-cloud"
                />
                <FontAwesomeIcon
                    v-else
                    class="data-disclaimer-tooltip text-secondary"
                    icon="hard-drive"
                    data-cy="menu-external-disclaimer-icon-hard-drive"
                />
            </ThirdPartyDisclaimer>
            <button
                class="btn border-0 d-flex align-items-center"
                :class="{
                    'btn-lg': !compact,
                    'flip text-primary': showLayerDetail,
                }"
                :data-cy="`button-open-visible-layer-settings-${id}-${index}`"
                @click="emit('toggleLayerDetail', index)"
            >
                <FontAwesomeIcon icon="cog" />
            </button>
        </div>
        <div
            v-show="showLayerDetail"
            :data-cy="`div-layer-settings-${id}-${index}`"
        >
            <div class="d-flex mx-1 align-items-center">
                <label
                    :for="`transparency-${id}`"
                    class="menu-layer-options"
                >
                    {{ t('transparency') }}
                </label>
                <input
                    :id="`transparency-${id}`"
                    ref="transparencySlider"
                    class="menu-layer-transparency-slider ms-2 me-4 flex-grow-1"
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.01"
                    :value="1.0 - layer.opacity"
                    :data-cy="`slider-transparency-layer-${id}-${index}`"
                    @mouseup="onTransparencyCommit"
                    @input="debounceTransparencyChange"
                />
                <div class="btn-group">
                    <button
                        v-if="hasMultipleTimestamps"
                        ref="duplicateLayerButton"
                        class="layer-options-btn"
                        :class="{ 'btn-lg': !compact }"
                        :data-cy="`button-duplicate-layer-${id}-${index}`"
                        @click.prevent="duplicateLayer()"
                    >
                        <FontAwesomeIcon :icon="['far', 'copy']" />
                    </button>
                    <button
                        ref="layerUpButton"
                        class="layer-options-btn"
                        :class="{ 'btn-lg': !compact }"
                        :disabled="isTopLayer"
                        :data-cy="`button-raise-order-layer-${id}-${index}`"
                        @click.prevent="emit('moveLayer', index, index + 1)"
                    >
                        <FontAwesomeIcon icon="arrow-up" />
                    </button>
                    <button
                        ref="layerDownButton"
                        class="layer-options-btn"
                        :class="{ 'btn-lg': !compact }"
                        :disabled="isBottomLayer"
                        :data-cy="`button-lower-order-layer-${id}-${index}`"
                        @click.prevent="emit('moveLayer', index, index - 1)"
                    >
                        <FontAwesomeIcon icon="arrow-down" />
                    </button>
                    <button
                        v-if="showLayerDescriptionIcon"
                        class="layer-options-btn"
                        :class="{ 'btn-lg': !compact }"
                        :data-cy="`button-show-description-layer-${id}-${index}`"
                        @click="showLayerDescriptionPopup"
                    >
                        <FontAwesomeIcon icon="info-circle" />
                    </button>
                </div>
            </div>
            <div
                v-if="isLayerKml"
                v-show="showLayerDetail"
                class="p-1 d-block"
            >
                <div
                    v-if="is3dActive"
                    class="form-check form-switch"
                >
                    <label
                        class="menu-layer-options me-2 form-check-label"
                        :for="`checkbox-clamp-to-ground-${id}`"
                    >
                        {{ t('clamp_to_ground') }}
                    </label>
                    <input
                        :id="`checkbox-clamp-to-ground-${id}`"
                        v-model="isLayerClampedToGround"
                        type="checkbox"
                        class="form-check-input"
                    />
                </div>
                <div
                    v-else
                    class="d-flex align-items-center"
                >
                    <label class="menu-layer-options me-2">
                        {{ t('vector_feedback_select_style') }}
                    </label>
                    <DropdownButton
                        :title="currentKmlStyle.toLowerCase()"
                        :items="kmlStylesAsDropdownItems"
                        :current-value="currentKmlStyle"
                        small
                        @select-item="changeStyle"
                    />
                </div>
            </div>
        </div>
    </div>
    <slot />
</template>

<style lang="scss" scoped>
@import 'bootstrap';
@import '@/scss/webmapviewer-bootstrap-theme';
@import '@/modules/menu/scss/menu-items';

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
.menu-layer-options {
    $smallerFont: 0.9em;
    font-size: $smallerFont;
    // also setting the line height, so that vertical alignment isn't broken
    line-height: $smallerFont;
}
.menu-layer-transparency-slider {
    display: flex;
    flex-grow: 1;
    cursor: pointer;
    width: 100%;
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

.layer-options-btn {
    @extend .btn;
    @extend .d-flex;
    @extend .align-items-center;
    @extend .px-2;
    @extend .border-0;
}
</style>
