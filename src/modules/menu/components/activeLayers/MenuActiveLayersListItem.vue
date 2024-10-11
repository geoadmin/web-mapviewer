<script setup>
/**
 * Representation of an active layer in the menu, with the name of the layer and some controls (like
 * visibility, opacity or position in the layer stack)
 */

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, onMounted, ref, toRefs } from 'vue'
import { useStore } from 'vuex'

import AbstractLayer from '@/api/layers/AbstractLayer.class'
import GPXLayer from '@/api/layers/GPXLayer.class.js'
import KMLLayer from '@/api/layers/KMLLayer.class.js'
import MenuActiveLayersListItemTimeSelector from '@/modules/menu/components/activeLayers/MenuActiveLayersListItemTimeSelector.vue'
import ErrorButton from '@/utils/components/ErrorButton.vue'
import TextTruncate from '@/utils/components/TextTruncate.vue'
import ThirdPartyDisclaimer from '@/utils/components/ThirdPartyDisclaimer.vue'
import ZoomToExtentButton from '@/utils/components/ZoomToExtentButton.vue'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'
import debounce from '@/utils/debounce'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'MenuActiveLayersListItem.vue' }

const props = defineProps({
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
const { index, layer, showLayerDetail, focusMoveButton, isTopLayer, isBottomLayer, compact } =
    toRefs(props)

const emit = defineEmits(['showLayerDescriptionPopup', 'toggleLayerDetail', 'moveLayer'])

const store = useStore()

useTippyTooltip('.menu-layer-item [data-tippy-content]')

const layerUpButton = ref(null)
const layerDownButton = ref(null)
const transparencySlider = ref(null)
const id = computed(() => layer.value.id)
const isLocalFile = computed(() => store.getters.isLocalFile(layer.value))
const hasDataDisclaimer = computed(() =>
    store.getters.hasDataDisclaimer(id.value, layer.value.isExternal, layer.value.baseUrl)
)
const attributionName = computed(() =>
    layer.value.attributions.map((attribution) => attribution.name).join(', ')
)
const showLayerDescriptionIcon = computed(() => layer.value.hasDescription)
const hasMultipleTimestamps = computed(() => layer.value.hasMultipleTimestamps)
const isPhoneMode = computed(() => store.getters.isPhoneMode)
const is3dActive = computed(() => store.state.cesium.active)

const isLayerKmlOrGpx = computed(
    () => layer.value instanceof KMLLayer || layer.value instanceof GPXLayer
)

// only show the spinner for external layer, for our layers the
// backend should be quick enough and don't require any spinner
const showSpinner = computed(
    () => layer.value.isLoading && layer.value.isExternal && !layer.value.hasError
)

onMounted(() => {
    if (showLayerDetail.value) {
        if (focusMoveButton.value === 'up') {
            layerUpButton.value.focus()
        } else if (focusMoveButton.value === 'down') {
            layerDownButton.value.focus()
        }
    }
})

function onRemoveLayer() {
    store.dispatch('removeLayer', { index: index.value, ...dispatcher })
}

function onToggleLayerVisibility() {
    store.dispatch('toggleLayerVisibility', { index: index.value, ...dispatcher })
}

function dispatchOpacity(opacity) {
    if (layer.value.opacity.toFixed(2) !== opacity.toFixed(2)) {
        store.dispatch('setLayerOpacity', {
            index: index.value,
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
}

function duplicateLayer() {
    store.dispatch('addLayer', { layer: layer.value.clone(), ...dispatcher })
}
</script>

<template>
    <div
        ref="menuLayerItem"
        class="menu-layer-item"
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
                >{{ layer.name }}</TextTruncate
            >
            <ZoomToExtentButton v-if="layer.extent" :extent="layer.extent" />
            <button
                v-if="showSpinner"
                class="loading-button btn border-0 d-flex align-items-center"
                :class="{
                    'btn-lg': !compact,
                }"
                data-tippy-content="loading_external_layer"
                :data-cy="`button-loading-metadata-spinner-${id}-${index}`"
            >
                <FontAwesomeIcon icon="spinner" pulse />
            </button>
            <ErrorButton
                v-else-if="layer.hasError"
                :compact="compact"
                :error-message="layer.getFirstErrorKey()"
                :data-cy="`button-error-${id}-${index}`"
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
            class="menu-layer-item-details"
            :data-cy="`div-layer-settings-${id}-${index}`"
        >
            <label :for="`transparency-${id}`" class="menu-layer-transparency-title">
                {{ $t('transparency') }}
            </label>
            <input
                :id="`transparency-${id}`"
                ref="transparencySlider"
                :disabled="isLayerKmlOrGpx && is3dActive"
                class="menu-layer-transparency-slider ms-2 me-4"
                type="range"
                min="0.0"
                max="1.0"
                step="0.01"
                :value="1.0 - layer.opacity"
                :data-cy="`slider-transparency-layer-${id}-${index}`"
                @mouseup="onTransparencyCommit"
                @input="debounceTransparencyChange"
            />
            <button
                v-if="hasMultipleTimestamps"
                class="btn d-flex align-items-center"
                :class="{ 'btn-lg': !compact }"
                :data-cy="`button-duplicate-layer-${id}-${index}`"
                data-tippy-content="duplicate_layer"
                @click.prevent="duplicateLayer()"
            >
                <FontAwesomeIcon :icon="['far', 'copy']" />
            </button>
            <button
                ref="layerUpButton"
                class="btn-layer-up-down btn d-flex align-items-center"
                :class="{ 'btn-lg': !compact }"
                :disabled="isTopLayer"
                :data-cy="`button-raise-order-layer-${id}-${index}`"
                @click.prevent="emit('moveLayer', index, index + 1)"
            >
                <FontAwesomeIcon icon="arrow-up" />
            </button>
            <button
                ref="layerDownButton"
                class="btn-layer-up-down btn d-flex align-items-center"
                :class="{ 'btn-lg': !compact }"
                :disabled="isBottomLayer"
                :data-cy="`button-lower-order-layer-${id}-${index}`"
                @click.prevent="emit('moveLayer', index, index - 1)"
            >
                <FontAwesomeIcon icon="arrow-down" />
            </button>
            <button
                v-if="showLayerDescriptionIcon"
                class="btn d-flex align-items-center"
                :class="{ 'btn-lg': !compact }"
                :data-cy="`button-show-description-layer-${id}-${index}`"
                @click="showLayerDescriptionPopup"
            >
                <FontAwesomeIcon icon="info-circle" />
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
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
.menu-layer-transparency-title {
    font-size: 0.9em;
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

.btn-layer-up-down:disabled {
    border: none;
}
</style>
