<script setup>
/** Tools necessary to edit a feature from the drawing module. */

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import EditableFeature, { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { DEFAULT_ICON_URL_PARAMS } from '@/api/icon.api'
import FeatureAreaInfo from '@/modules/infobox/components/FeatureAreaInfo.vue'
import DrawingStyleColorSelector from '@/modules/infobox/components/styling/DrawingStyleColorSelector.vue'
import DrawingStyleIconSelector from '@/modules/infobox/components/styling/DrawingStyleIconSelector.vue'
import DrawingStyleMediaLink from '@/modules/infobox/components/styling/DrawingStyleMediaLink.vue'
import DrawingStylePopoverButton from '@/modules/infobox/components/styling/DrawingStylePopoverButton.vue'
import DrawingStyleSizeSelector from '@/modules/infobox/components/styling/DrawingStyleSizeSelector.vue'
import DrawingStyleTextColorSelector from '@/modules/infobox/components/styling/DrawingStyleTextColorSelector.vue'
import MediaTypes from '@/modules/infobox/DrawingStyleMediaTypes.enum.js'
import CoordinateCopySlot from '@/utils/components/CoordinateCopySlot.vue'
import allFormats from '@/utils/coordinates/coordinateFormat'
import debounce from '@/utils/debounce'
import { calculateTextOffset } from '@/utils/featureStyleUtils'

const dispatcher = { dispatcher: 'FeatureStyleEdit.vue' }

const props = defineProps({
    feature: {
        type: EditableFeature,
        required: true,
    },
    readOnly: {
        type: Boolean,
        default: false,
    },
})
const { feature, readOnly } = toRefs(props)

const title = ref(feature.value.title)
const description = ref(feature.value.description)
const mediaPopovers = ref(null)

// Update the UI when the feature changes
watch(
    () => feature.value.title,
    (newTitle) => {
        title.value = newTitle
    }
)

watch(
    () => feature.value.description,
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

// Here we need to declare the debounce method globally otherwise it does not work (it is based
// on closure which will not work if the debounce method is defined in a watcher)
// The title debounce needs to be quick in order to be displayed on the map
const debounceTitleUpdate = debounce(updateFeatureTitle, 100)
// The description don't need a quick debounce as it is not displayed on the map
const debounceDescriptionUpdate = debounce(updateFeatureDescription, 300)

function updateFeatureTitle() {
    store.dispatch('changeFeatureTitle', {
        feature: feature.value,
        title: title.value,
        ...dispatcher,
    })
}

function updateFeatureDescription() {
    store.dispatch('changeFeatureDescription', {
        feature: feature.value,
        description: description.value,
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
const isFeatureMarker = computed(() => feature.value.featureType === EditableFeatureTypes.MARKER)
const isFeatureText = computed(() => feature.value.featureType === EditableFeatureTypes.ANNOTATION)
const isFeatureLine = computed(() => feature.value.featureType === EditableFeatureTypes.LINEPOLYGON)

const store = useStore()
const availableIconSets = computed(() => store.state.drawing.iconSets)

function onTextSizeChange(textSize) {
    store.dispatch('changeFeatureTextSize', { feature: feature.value, textSize, ...dispatcher })
    updateTextOffset()
}
function onTextColorChange(textColor) {
    store.dispatch('changeFeatureTextColor', { feature: feature.value, textColor, ...dispatcher })
}
function onColorChange(color) {
    store.dispatch('changeFeatureColor', { feature: feature.value, color, ...dispatcher })
}
function onIconChange(icon) {
    store.dispatch('changeFeatureIcon', { feature: feature.value, icon, ...dispatcher })
    updateTextOffset()
}
function onIconSizeChange(iconSize) {
    store.dispatch('changeFeatureIconSize', { feature: feature.value, iconSize, ...dispatcher })
    updateTextOffset()
}
function onDelete() {
    store.dispatch('deleteDrawingFeature', { featureId: feature.value.id, ...dispatcher })
}
function onAddMediaLink(mediaPopoverIndex, descriptionMediaLink) {
    mediaPopovers.value[mediaPopoverIndex].hidePopover()
    description.value += descriptionMediaLink
}

function updateTextOffset() {
    if (isFeatureMarker.value) {
        const offset = calculateTextOffset(
            feature.value.textSize.textScale,
            feature.value.iconSize.iconScale,
            feature.value.icon.anchor,
            DEFAULT_ICON_URL_PARAMS.size //TODO: PB-303 Use icon size from backend
        )

        store.dispatch('changeFeatureTextOffset', {
            feature: feature.value,
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
        <div v-if="isFeatureMarker || isFeatureText" class="form-group mb-2">
            <label class="form-label" for="drawing-style-feature-title">
                {{ $t('draw_popup_title_annotation') }}
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
            ></textarea>
        </div>

        <div v-if="!isFeatureText" class="form-group mb-2">
            <div class="d-flex justify-content-between">
                <label class="form-label" for="drawing-style-feature-description">
                    {{ $t('modify_description') }}
                </label>
                <div class="d-flex justify-content-end align-items-center">
                    <div v-for="(media, index) in mediaTypes()" :key="media.type">
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
                ></textarea>
            </div>
        </div>
        <div class="d-flex small gap-1 justify-content-start align-items-center">
            <CoordinateCopySlot
                v-if="isFeatureMarker || isFeatureText"
                identifier="feature-style-edit-coordinate-copy"
                :value="feature.coordinates[0].slice(0, 2)"
                :coordinate-format="coordinateFormat"
            >
                <FontAwesomeIcon class="small pe-2 align-text-top" icon="fas fa-map-marker-alt" />
            </CoordinateCopySlot>
            <FeatureAreaInfo
                v-if="feature.geometry.type === 'Polygon'"
                :geometry="feature.geometry"
            />
        </div>
        <div class="d-flex justify-content-end align-items-center">
            <div v-if="!readOnly" class="d-flex gap-1 feature-style-edit-control">
                <DrawingStylePopoverButton
                    v-if="isFeatureMarker || isFeatureText"
                    data-cy="drawing-style-text-button"
                    icon="font"
                >
                    <div data-cy="drawing-style-text-popup">
                        <DrawingStyleSizeSelector
                            class="mb-3"
                            :current-size="feature.textSize"
                            @change="onTextSizeChange"
                        />
                        <DrawingStyleTextColorSelector
                            :current-color="feature.textColor"
                            @change="onTextColorChange"
                        />
                    </div>
                </DrawingStylePopoverButton>

                <DrawingStylePopoverButton
                    v-if="isFeatureMarker"
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

                <DrawingStylePopoverButton
                    v-if="isFeatureLine"
                    data-cy="drawing-style-line-button"
                    :popover-title="$t('modify_color_label')"
                    icon="paint-brush"
                >
                    <DrawingStyleColorSelector
                        data-cy="drawing-style-line-popup"
                        :current-color="feature.fillColor"
                        @change="onColorChange"
                    />
                </DrawingStylePopoverButton>

                <button
                    class="btn btn-sm btn-light d-flex align-items-center"
                    data-cy="drawing-style-delete-button"
                    @click="onDelete"
                >
                    <FontAwesomeIcon icon="far fa-trash-alt" />
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.feature-title {
    height: 1rem;
}
</style>
