<script setup>
/** Tools necessary to edit a feature from the drawing module. */

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GeoadminTooltip from '@geoadmin/tooltip'
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import EditableFeature, { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import FeatureAreaInfo from '@/modules/infobox/components/FeatureAreaInfo.vue'
import ShowGeometryProfileButton from '@/modules/infobox/components/ShowGeometryProfileButton.vue'
import DrawingStyleColorSelector from '@/modules/infobox/components/styling/DrawingStyleColorSelector.vue'
import DrawingStyleIconSelector from '@/modules/infobox/components/styling/DrawingStyleIconSelector.vue'
import DrawingStyleMediaLink from '@/modules/infobox/components/styling/DrawingStyleMediaLink.vue'
import DrawingStylePositionSelector from '@/modules/infobox/components/styling/DrawingStylePlacementSelector.vue'
import DrawingStylePopoverButton from '@/modules/infobox/components/styling/DrawingStylePopoverButton.vue'
import DrawingStyleSizeSelector from '@/modules/infobox/components/styling/DrawingStyleSizeSelector.vue'
import DrawingStyleTextColorSelector from '@/modules/infobox/components/styling/DrawingStyleTextColorSelector.vue'
import MediaTypes from '@/modules/infobox/DrawingStyleMediaTypes.enum.js'
import CoordinateCopySlot from '@/utils/components/CoordinateCopySlot.vue'
import allFormats from '@/utils/coordinates/coordinateFormat'
import debounce from '@/utils/debounce'
import { calculateTextOffset } from '@/utils/featureStyleUtils'

const dispatcher = { dispatcher: 'FeatureStyleEdit.vue' }

const { feature, readOnly } = defineProps({
    feature: {
        type: EditableFeature,
        required: true,
    },
    readOnly: {
        type: Boolean,
        default: false,
    },
})

const { t } = useI18n()

const title = ref(feature.title)
const description = ref(feature.description)
const showDescriptionOnMap = computed({
    get: () => !!feature.showDescriptionOnMap,
    set: (value) => {
        store.dispatch('changeFeatureShownDescriptionOnMap', {
            feature: feature,
            showDescriptionOnMap: value,
            ...dispatcher,
        })
    },
})
const mediaPopovers = useTemplateRef('mediaPopovers')
const isEditingText = computed(() => {
    const titleElement = document.getElementById('drawing-style-feature-title')
    const descriptionElement = document.getElementById('drawing-style-feature-description')
    return document.activeElement === titleElement || document.activeElement === descriptionElement
})

// Update the UI when the feature changes
watch(
    () => feature.title,
    (newTitle) => {
        title.value = newTitle
    }
)

watch(
    () => feature.description,
    (newDescription) => {
        description.value = newDescription
    }
)

// The idea is watching the title and the description.
// Put a debounce on the update of the feature so that we can compare with the current UI state
// If the value is the same as in the UI, we can update the feature
watch(title, () => {
    debounceTitleUpdate(store)
})
watch(description, () => {
    debounceDescriptionUpdate(store)
})

onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
})

// Here we need to declare the debounce method globally otherwise it does not work (it is based
// on closure which will not work if the debounce method is defined in a watcher)
// The title debounce needs to be quick in order to be displayed on the map
const debounceTitleUpdate = debounce(updateFeatureTitle, 100)
// The description don't need a quick debounce as it is not displayed on the map
const debounceDescriptionUpdate = debounce(updateFeatureDescription, 300)

function handleKeydown(event) {
    if (event.key === 'Delete' && !isEditingText.value) {
        onDelete()
    }
}

function updateFeatureTitle() {
    store.dispatch('changeFeatureTitle', {
        feature: feature,
        title: title.value.trim(),
        ...dispatcher,
    })
    // Update the text offset if the feature is a marker
    if (feature.featureType === EditableFeatureTypes.MARKER) {
        updateTextOffset()
    }
}

function updateFeatureDescription() {
    store.dispatch('changeFeatureDescription', {
        feature: feature,
        description: description.value,
        showDescriptionOnMap: showDescriptionOnMap.value,
        ...dispatcher,
    })
}

const coordinateFormat = computed(() => {
    return allFormats.find((format) => format.id === store.state.position.displayedFormatId) ?? null
})

/**
 * The length parameter must be greater than 3, because the polygon has one point twice : the first
 * and last point are both existing in the same exact space. A point would be length 2, a line would
 * be length 3. We do not consider the case where there are more than 3 points, but all in a single
 * line.
 *
 * @type {ComputedRef<Boolean>}
 */
const isFeatureMarker = computed(() => feature.featureType === EditableFeatureTypes.MARKER)
const isFeatureText = computed(() => feature.featureType === EditableFeatureTypes.ANNOTATION)
const isFeatureLinePolygon = computed(() => feature.featureType === EditableFeatureTypes.LINEPOLYGON)
const isFeatureMeasure = computed(() => feature.featureType === EditableFeatureTypes.MEASURE)
const isLine = computed(() => feature.geometry.type === 'LineString')

const store = useStore()
const availableIconSets = computed(() => store.state.drawing.iconSets)

function onTextSizeChange(textSize) {
    store.dispatch('changeFeatureTextSize', { feature: feature, textSize, ...dispatcher })
    updateTextOffset()
}
function onPlacementChange(textPlacement) {
    store.dispatch('changeFeatureTextPlacement', {
        feature: feature,
        textPlacement,
        ...dispatcher,
    })
    updateTextOffset()
}
function onTextColorChange(textColor) {
    store.dispatch('changeFeatureTextColor', { feature: feature, textColor, ...dispatcher })
}
function onColorChange(color) {
    store.dispatch('changeFeatureColor', { feature: feature, color, ...dispatcher })
}
function onIconChange(icon) {
    store.dispatch('changeFeatureIcon', { feature: feature, icon, ...dispatcher })
    updateTextOffset()
}
function onIconSizeChange(iconSize) {
    store.dispatch('changeFeatureIconSize', { feature: feature, iconSize, ...dispatcher })
    updateTextOffset()
}
function onDelete() {
    store.dispatch('deleteDrawingFeature', { featureId: feature.id, ...dispatcher })
}
function onAddMediaLink(mediaPopoverIndex, descriptionMediaLink) {
    mediaPopovers.value[mediaPopoverIndex].hidePopover()
    description.value += descriptionMediaLink
}

function updateTextOffset() {
    if (isFeatureMarker.value) {
        const offset = calculateTextOffset(
            feature.textSize.textScale,
            feature.iconSize.iconScale,
            feature.icon.anchor,
            feature.icon.size,
            feature.textPlacement,
            title.value
        )

        store.dispatch('changeFeatureTextOffset', {
            feature: feature,
            textOffset: offset,
            ...dispatcher,
        })
    }
}

function mediaTypes() {
    return [
        {
            type: MediaTypes.link,
            buttonClassOptions: 'rounded-0 rounded-top-2 rounded-end-0',
            icon: 'fa-link',
            extraUrlDescription: 'text_to_display',
        },
        {
            type: MediaTypes.image,
            buttonClassOptions: 'rounded-0',
            icon: 'fa-image',
        },
        {
            type: MediaTypes.video,
            buttonClassOptions: 'rounded-0 rounded-top-2 rounded-start-0',
            icon: 'fa-film',
        },
    ]
}
</script>

<template>
    <div data-cy="drawing-style-popup">
        <div
            v-if="isFeatureMarker || isFeatureText"
            class="form-group mb-3"
        >
            <label
                class="form-label"
                for="drawing-style-feature-title"
            >
                {{ t('draw_popup_title_annotation') }}
            </label>
            <textarea
                id="drawing-style-feature-title"
                v-model="title"
                :readonly="readOnly"
                data-cy="drawing-style-feature-title"
                class="feature-title form-control"
                :class="{
                    'form-control-plaintext': readOnly,
                }"
                rows="1"
            />
        </div>

        <div
            v-if="!isFeatureText"
            class="form-group mb-3"
        >
            <div class="d-flex justify-content-between">
                <div class="d-flex justify-content-between align-items-center gap-1">
                    <label
                        class="form-label"
                        for="drawing-style-feature-description"
                    >
                        {{ t('modify_description') }}
                    </label>
                    <GeoadminTooltip
                        placement="left"
                        :tooltip-content="t('display_on_map')"
                    >
                        <button
                            class="btn btn-sm btn-light d-flex align-items-center mb-2"
                            @click="showDescriptionOnMap = !showDescriptionOnMap"
                        >
                            <FontAwesomeIcon
                                :icon="showDescriptionOnMap ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"
                                class="small"
                            />
                        </button>
                    </GeoadminTooltip>
                </div>
                <div class="d-flex justify-content-end align-items-center mb-2">
                    <div
                        v-for="(media, index) in mediaTypes()"
                        :key="media.type"
                    >
                        <GeoadminTooltip :tooltip-content="t('add') + ' ' + t(`url_${media.type}`)">
                            <DrawingStylePopoverButton
                                ref="mediaPopovers"
                                :data-cy="`drawing-style-${media.type}-button`"
                                :button-class-options="media.buttonClassOptions"
                                :icon="media.icon"
                            >
                                <DrawingStyleMediaLink
                                    :media-type="media.type"
                                    :url-label="`url_${media.type}`"
                                    :description-label="
                                        media.extraUrlDescription ? media.extraUrlDescription : ''
                                    "
                                    @generated-media-link="onAddMediaLink(index, $event)"
                                />
                            </DrawingStylePopoverButton>
                        </GeoadminTooltip>
                    </div>
                </div>
            </div>
            <div>
                <textarea
                    id="drawing-style-feature-description"
                    v-model="description"
                    :readonly="readOnly"
                    data-cy="drawing-style-feature-description"
                    class="feature-description form-control rounded-0 rounded-bottom-2 rounded-start-2"
                    :class="{
                        'form-control-plaintext': readOnly,
                    }"
                    rows="2"
                />
            </div>

        </div>
        <div class="d-flex small justify-content-start align-items-center mb-1 gap-1">
            <CoordinateCopySlot
                v-if="isFeatureMarker || isFeatureText"
                identifier="feature-style-edit-coordinate-copy"
                :value="feature.coordinates[0].slice(0, 2)"
                :coordinate-format="coordinateFormat"
            >
                <FontAwesomeIcon
                    class="small pe-2 align-text-top"
                    icon="fas fa-map-marker-alt"
                />
            </CoordinateCopySlot>
            <FeatureAreaInfo
                v-if="feature.geometry.type === 'Polygon'"
                :geometry="feature.geometry"
            />
        </div>
        <div class="d-flex justify-content-end align-items-center">
            <div
                v-if="!readOnly"
                class="d-flex feature-style-edit-control gap-1"
            >
                <ShowGeometryProfileButton
                    v-if="isFeatureLinePolygon || isFeatureMeasure"
                    :feature="feature"
                />
                <GeoadminTooltip
                    v-if="isFeatureMarker || isFeatureText"
                    :tooltip-content="t('drawing_text_style')"
                >
                    <DrawingStylePopoverButton
                        data-cy="drawing-style-text-button"
                        icon="font"
                    >
                        <div data-cy="drawing-style-text-popup">
                            <DrawingStyleSizeSelector
                                class="mb-3"
                                :current-size="feature.textSize"
                                @change="onTextSizeChange"
                            />
                            <DrawingStylePositionSelector
                                v-if="isFeatureMarker"
                                class="mb-3"
                                :current-placement="feature.textPlacement"
                                @change="onPlacementChange"
                            />
                            <DrawingStyleTextColorSelector
                                :current-color="feature.textColor"
                                @change="onTextColorChange"
                            />
                        </div>
                    </DrawingStylePopoverButton>
                </GeoadminTooltip>

                <GeoadminTooltip
                    v-if="isFeatureMarker"
                    :tooltip-content="t('drawing_marker_style')"
                >

                    <DrawingStylePopoverButton
                        data-cy="drawing-style-marker-button"
                        icon="fas fa-map-marker-alt"
                    >
                        <DrawingStyleIconSelector
                        data-cy="drawing-style-marker-popup"
                        :feature="feature"
                        :icon-sets="availableIconSets"
                        @change:icon="onIconChange"
                        @change:icon-color="onColorChange"
                        @change:icon-size="onIconSizeChange"
                        />
                    </DrawingStylePopoverButton>
                </GeoadminTooltip>

                <GeoadminTooltip
                    v-if="isFeatureLinePolygon"
                    :tooltip-content="isLine ? t('drawing_line_style') : t('drawing_polygon_style')"
                >
                    <DrawingStylePopoverButton
                        data-cy="drawing-style-line-button"
                        :popover-title="t('modify_color_label')"
                        icon="paint-brush"
                    >
                        <DrawingStyleColorSelector
                            data-cy="drawing-style-line-popup"
                            :current-color="feature.fillColor"
                            @change="onColorChange"
                        />
                    </DrawingStylePopoverButton>
                </GeoadminTooltip>
                <GeoadminTooltip
                    :tooltip-content="t('draw_delete')"
                >
                    <button
                        class="btn btn-sm btn-light d-flex align-items-center"
                        data-cy="drawing-style-delete-button"
                        @click="onDelete"
                    >
                        <FontAwesomeIcon icon="far fa-trash-alt" />
                    </button>
                </GeoadminTooltip>
            </div>
        </div>
    </div>
</template>
