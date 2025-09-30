<script setup lang="ts">
/**
 * Representation of an active layer in the menu, with the name of the layer and some controls (like
 * visibility, opacity or position in the layer stack)
 */

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import MenuActiveLayersListItemTimeSelector from '@/modules/menu/components/activeLayers/MenuActiveLayersListItemTimeSelector.vue'
import TransparencySlider from '@/modules/menu/components/activeLayers/TransparencySlider.vue'
import DropdownButton from '@/utils/components/DropdownButton.vue'
import ExtLayerInfoButton from '@/utils/components/ExtLayerInfoButton.vue'
import TextTruncate from '@/utils/components/TextTruncate.vue'
import ThirdPartyDisclaimer from '@/utils/components/ThirdPartyDisclaimer.vue'
import ZoomToExtentButton from '@/utils/components/ZoomToExtentButton.vue'
import {
    type KMLLayer,
    KMLStyle,
    LayerType,
    type Layer,
    type ExternalLayer,
} from '@swissgeo/layers'
import useLayersStore from '@/store/modules/layers.store'
import { layerUtils, timeConfigUtils } from '@swissgeo/layers/utils'
import useUIStore from '@/store/modules/ui.store'
import useCesiumStore from '@/store/modules/cesium.store'

const dispatcher = { name: 'MenuActiveLayersListItem.vue' }

const {
    index,
    layer,
    showLayerDetail,
    focusMoveButton,
    isTopLayer = false,
    isBottomLayer = false,
    compact = false,
} = defineProps<{
    index: number
    layer: Layer
    showLayerDetail?: boolean
    focusMoveButton?: string
    isTopLayer: boolean
    isBottomLayer: boolean
    compact?: boolean
}>()

const emit = defineEmits(['showLayerDescriptionPopup', 'toggleLayerDetail', 'moveLayer'])

const { t } = useI18n()
const layersStore = useLayersStore()
const uiStore = useUIStore()
const cesiumStore = useCesiumStore()

const layerUpButton = useTemplateRef('layerUpButton')
const layerDownButton = useTemplateRef('layerDownButton')
const currentKmlStyle = ref<KMLStyle | null>((layer as KMLLayer)?.style ?? null)
const id = computed(() => layer.id)

/** @type {ComputedRef<DropdownItem[]>} */
const kmlStylesAsDropdownItems = computed(() =>
    Object.values(KMLStyle).map((style: KMLStyle) => ({
        id: style,
        title: style.toLowerCase(),
        value: style,
    }))
)

const isLocalFile = computed(() => layersStore.isLocalFile(layer))

const hasDataDisclaimer = computed(() =>
    layersStore.hasDataDisclaimer(id.value, layer.isExternal, layer.baseUrl)
)

const attributionName = computed(() =>
    layer.attributions.map((attribution) => attribution.name).join(', ')
)

const showLayerDescriptionIcon = computed(() => layer.hasDescription)
const hasMultipleTimestamps = computed(() => timeConfigUtils.hasMultipleTimestamps(layer))
const isPhoneMode = computed(() => uiStore.isPhoneMode)
const is3dActive = computed(() => cesiumStore.active)

const isLayerKml = computed(() => layer.type === LayerType.KML)

const isLayerClampedToGround = computed({
    get: () => 'clampToGround' in layer && layer.clampToGround,
    set: (value: boolean) => {
        layersStore.updateLayer<KMLLayer>(
            {
                layerId: id.value,
                values: {
                    clampToGround: value,
                },
            },
            dispatcher
        )
    },
})

// only show the spinner for external layer, for our layers the
// backend should be quick enough and don't require any spinner
const showSpinner = computed(() => layer.isLoading && layer.isExternal && !layer.hasError)

onMounted(() => {
    if (showLayerDetail) {
        if (focusMoveButton === 'up' && layerUpButton.value) {
            layerUpButton.value.focus()
        } else if (focusMoveButton === 'down' && layerDownButton.value) {
            layerDownButton.value.focus()
        }
    }
})

function onRemoveLayer() {
    layersStore.removeLayer({ index }, dispatcher)
}

function onToggleLayerVisibility() {
    layersStore.toggleLayerVisibility(index, dispatcher)
}

function showLayerDescriptionPopup() {
    emit('showLayerDescriptionPopup', id.value)
    //close menu on mobile only
    if (isPhoneMode.value) {
        uiStore.toggleMenu(dispatcher)
    }
}

function duplicateLayer() {
    layersStore.addLayer({ layer: layerUtils.cloneLayer(layer) }, dispatcher)
}

function changeStyle(newStyle: { value: KMLStyle }) {
    layersStore.updateLayer<KMLLayer>(
        {
            layerId: id.value,
            values: {
                style: newStyle.value,
            },
        },
        dispatcher
    )
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
                class="btn d-flex align-items-center border-0"
                :class="{ 'btn-lg': !compact }"
                :data-cy="`button-remove-layer-${id}-${index}`"
                @click="onRemoveLayer"
            >
                <FontAwesomeIcon icon="times-circle" />
            </button>
            <button
                class="btn d-flex align-items-center border-0"
                :class="{ 'btn-lg': !compact }"
                :data-cy="`button-toggle-visibility-layer-${id}-${index}`"
                @click="onToggleLayerVisibility"
            >
                <FontAwesomeIcon :icon="`far fa-${layer.isVisible ? 'check-' : ''}square`" />
            </button>
            <TextTruncate
                class="menu-layer-item-name p-1"
                :class="{ 'text-body-tertiary fst-italic': showSpinner }"
                :data-cy="`active-layer-name-${id}-${index}`"
                :tooltip-placement="isPhoneMode ? 'top' : 'right'"
                @click="onToggleLayerVisibility"
            >
                {{ layer.name }}
            </TextTruncate>
            <ZoomToExtentButton
                v-if="layer.extent"
                :extent="layer.extent"
                :extent-projection="layer.extentProjection"
            />
            <ExtLayerInfoButton
                :show-spinner="showSpinner"
                :layer="layer as ExternalLayer"
                :index="index"
                class="me-2"
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
                class="btn d-flex align-items-center border-0"
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
            v-if="showLayerDetail"
            :data-cy="`div-layer-settings-${id}-${index}`"
        >
            <div class="d-flex align-items-center mx-1">
                <label
                    :for="`transparency-${id}`"
                    class="menu-layer-options"
                >
                    {{ t('transparency') }}
                </label>

                <TransparencySlider
                    :layer="layer"
                    :index="index"
                />

                <div class="btn-group">
                    <GeoadminTooltip :tooltip-content="t('duplicate_layer')">
                        <button
                            v-if="hasMultipleTimestamps"
                            class="layer-options-btn"
                            :class="{ 'btn-lg': !compact }"
                            :data-cy="`button-duplicate-layer-${id}-${index}`"
                            @click.prevent="duplicateLayer()"
                        >
                            <FontAwesomeIcon :icon="['far', 'copy']" />
                        </button>
                    </GeoadminTooltip>
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
                class="d-block p-1"
            >
                <div
                    v-if="is3dActive"
                    class="form-check form-switch"
                >
                    <label
                        class="menu-layer-options form-check-label me-2"
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
                        v-if="currentKmlStyle"
                        :title="currentKmlStyle.toLowerCase()"
                        :items="kmlStylesAsDropdownItems"
                        :current-value="currentKmlStyle"
                        small
                        @selectItem="changeStyle"
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
    @extend %menu-item;

    border-bottom: 1px solid $gray-400;
}
.menu-layer-item-title {
    @extend %menu-title;
}
.menu-layer-item-name {
    @extend %menu-name;

    cursor: pointer;
}
.menu-layer-item-details {
    @extend %menu-title;

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
    /* stylelint-disable scss/at-extend-no-missing-placeholder */
    @extend .btn;
    @extend .d-flex;
    @extend .align-items-center;
    @extend .px-2;
    @extend .border-0;
    /* stylelint-enable scss/at-extend-no-missing-placeholder */
}

.btn-group {
    position: static !important;
}
</style>
