<script setup>
/** Tools necessary to edit a feature from the drawing module. */

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Polygon } from 'ol/geom'
import { getLength } from 'ol/sphere'
import { computed, ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import EditableFeature, { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { IS_TESTING_WITH_CYPRESS } from '@/config'
import DrawingStyleColorSelector from '@/modules/infobox/components/styling/DrawingStyleColorSelector.vue'
import DrawingStyleIconSelector from '@/modules/infobox/components/styling/DrawingStyleIconSelector.vue'
import DrawingStylePopoverButton from '@/modules/infobox/components/styling/DrawingStylePopoverButton.vue'
import DrawingStyleSizeSelector from '@/modules/infobox/components/styling/DrawingStyleSizeSelector.vue'
import DrawingStyleTextColorSelector from '@/modules/infobox/components/styling/DrawingStyleTextColorSelector.vue'
import SelectedFeatureProfile from '@/modules/infobox/components/styling/SelectedFeatureProfile.vue'
import CoordinateCopySlot from '@/utils/components/CoordinateCopySlot.vue'
import allFormats from '@/utils/coordinates/coordinateFormat'
import debounce from '@/utils/debounce'
import { round } from '@/utils/numberUtils'

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
// on closure which will not work if the debounce mehtod is defined in a watcher)
// The title debounce needs to be quick in order to be displayed on the map
// NOTE: to avoid race condition on cypress between the update of a feature and the closing of
// the drawing we need to speed up the debouncing, otherwise the dispatch changeFeatureTitle
// will trigger a save kml when the features have been already removed from the KML drawing layer
// resulting in an empty drawing.
const debounceTitleUpdate = debounce(updateFeatureTitle, IS_TESTING_WITH_CYPRESS ? 1 : 100)
// The description don't need a quick debounce as it is not displayed on the map
const debounceDescriptionUpdate = debounce(
    updateFeatureDescription,
    IS_TESTING_WITH_CYPRESS ? 1 : 300
)

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
 * OpenLayers polygons coordinates are in a triple array. The first array is the "ring", the second
 * is to hold the coordinates, which are in an array themselves. We don't have rings in this case,
 * so we need to create an ol geometry
 *
 * @type {ComputedRef<Polygon>}
 */
const geometry = computed(() => new Polygon([feature.value.coordinates]))
/** @type {ComputedRef<Number>} */
const length = computed(() => {
    const calculatedLength = getLength(geometry.value)
    let result = `${roundValueIfGreaterThan(calculatedLength, 100, 1000)}`
    if (calculatedLength > 100) {
        result += 'km'
    } else {
        result += 'm'
    }
    return result
})
/** @type {ComputedRef<Number>} */
const area = computed(() => {
    const calculatedArea = geometry.value.getArea()
    let result = ''
    if (calculatedArea) {
        result += roundValueIfGreaterThan(calculatedArea, 1000, 100000)
        if (calculatedArea > 10000) {
            result += 'km'
        } else {
            result += 'm'
        }
    }
    return result
})

/**
 * The length parameter must be greater than 3, because the polygon has one point twice : the first
 * and last point are both existing in the same exact space. A point would be length 2, a line would
 * be length 3. We do not consider the case where there are more than 3 points, but all in a single
 * line.
 *
 * @type {ComputedRef<Boolean>}
 */
const isFeatureClosed = computed(() => {
    const { coordinates } = feature.value
    return (
        coordinates.length > 3 &&
        coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
        coordinates[0][1] === coordinates[coordinates.length - 1][1]
    )
})
const isFeatureMarker = computed(() => feature.value.featureType === EditableFeatureTypes.MARKER)
const isFeatureText = computed(() => feature.value.featureType === EditableFeatureTypes.ANNOTATION)
const isFeatureLine = computed(() => feature.value.featureType === EditableFeatureTypes.LINEPOLYGON)
const isFeaturePolygon = computed(() => {
    return feature.value.featureType === EditableFeatureTypes.LINEPOLYGON && isFeatureClosed.value
})

const store = useStore()
const availableIconSets = computed(() => store.state.drawing.iconSets)

function roundValueIfGreaterThan(value, threshold, divider) {
    if (value > threshold) {
        return `${round(value / divider, 2)}`
    }
    return `${round(value, 2)}`
}
function onTextSizeChange(textSize) {
    store.dispatch('changeFeatureTextSize', { feature: feature.value, textSize, ...dispatcher })
}
function onTextColorChange(textColor) {
    store.dispatch('changeFeatureTextColor', { feature: feature.value, textColor, ...dispatcher })
}
function onColorChange(color) {
    store.dispatch('changeFeatureColor', { feature: feature.value, color, ...dispatcher })
}
function onIconChange(icon) {
    store.dispatch('changeFeatureIcon', { feature: feature.value, icon, ...dispatcher })
}
function onIconSizeChange(iconSize) {
    store.dispatch('changeFeatureIconSize', { feature: feature.value, iconSize, ...dispatcher })
}
function onDelete() {
    store.dispatch('deleteDrawingFeature', { featureId: feature.value.id, ...dispatcher })
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
            <label class="form-label" for="drawing-style-feature-description">
                {{ $t('modify_description') }}
            </label>
            <textarea
                id="drawing-style-feature-description"
                v-model="description"
                :readonly="readOnly"
                data-cy="drawing-style-feature-description"
                class="feature-description form-control"
                :class="{
                    'form-control-plaintext': readOnly,
                }"
            ></textarea>
            <div>{{ feature.featureType }}</div>
            <div class="d-flex gap-2 py-2">
                <div v-if="isFeatureLine">
                    <font-awesome-icon :icon="['fa', 'ruler']" />
                    {{ length }}
                </div>
                <div v-if="isFeaturePolygon || isFeaturePolygonMeasure">
                    <font-awesome-icon :icon="['fa', 'arrows-up-down-left-right']" />
                    {{ area }}
                    <sup>2</sup>
                </div>
            </div>
        </div>
        <div v-if="isFeatureMarker || isFeatureText" class="d-flex small justify-content-start">
            <CoordinateCopySlot
                identifier="feature-style-edit-coordinate-copy"
                :value="feature.coordinates[0].slice(0, 2)"
                :coordinate-format="coordinateFormat"
            >
                <FontAwesomeIcon class="small pe-2 align-text-top" icon="fas fa-map-marker-alt" />
            </CoordinateCopySlot>
        </div>
        <div class="d-flex justify-content-end align-items-center">
            <SelectedFeatureProfile :feature="feature" />

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
.feature-description {
    height: 2rem;
}
</style>
