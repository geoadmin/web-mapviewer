<script setup lang="ts">
/** Tools necessary to edit a feature from the drawing module. */

import type { IconProp } from '@fortawesome/fontawesome-svg-core'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import type { DrawingIcon } from '@/api/icon.api'
import type { ActionDispatcher } from '@/store/types'

import { EditableFeatureTypes } from '@/api/features.api'
import FeatureAreaInfo from '@/modules/infobox/components/FeatureAreaInfo.vue'
import ShowGeometryProfileButton from '@/modules/infobox/components/ShowGeometryProfileButton.vue'
import DrawingStyleColorSelector from '@/modules/infobox/components/styling/DrawingStyleColorSelector.vue'
import DrawingStyleIconSelector from '@/modules/infobox/components/styling/DrawingStyleIconSelector.vue'
import DrawingStyleMediaLink from '@/modules/infobox/components/styling/DrawingStyleMediaLink.vue'
import DrawingStylePositionSelector from '@/modules/infobox/components/styling/DrawingStylePlacementSelector.vue'
import DrawingStylePopoverButton from '@/modules/infobox/components/styling/DrawingStylePopoverButton.vue'
import DrawingStyleSizeSelector from '@/modules/infobox/components/styling/DrawingStyleSizeSelector.vue'
import DrawingStyleTextColorSelector from '@/modules/infobox/components/styling/DrawingStyleTextColorSelector.vue'
import { MediaType } from '@/modules/infobox/DrawingStyleMediaTypes.enum'
import useDrawingStore from '@/store/modules/drawing'
import CoordinateCopySlot from '@/utils/components/CoordinateCopySlot.vue'
import { allFormats, type CoordinateFormat, LV95Format } from '@/utils/coordinates/coordinateFormat'
import debounce from '@/utils/debounce'
import {
    calculateTextOffset,
    type FeatureStyleColor,
    type FeatureStyleSize,
    TextPlacement,
} from '@/utils/featureStyleUtils'

const dispatcher: ActionDispatcher = { name: 'FeatureStyleEdit.vue' }

const { readOnly = false } = defineProps<{
    readOnly?: boolean
}>()
const { t } = useI18n()

const drawingStore = useDrawingStore()

const displayedFormatId = ref<string>(LV95Format.id)

const title = computed<string>({
    get: () => drawingStore.feature.current?.title ?? '',
    set: (value: string) => debounceFeatureTitleUpdate(value),
})
const description = computed<string>({
    get: () => drawingStore.feature.current?.description ?? '',
    set: (value: string) => debounceDescriptionUpdate(value),
})
const showDescriptionOnMap = computed<boolean>({
    get: () => !!drawingStore.feature.current?.showDescriptionOnMap,
    set: (value: boolean) => {
        drawingStore.updateCurrentDrawingFeature(
            {
                showDescriptionOnMap: value,
            },
            dispatcher
        )
    },
})

type PopoverRef = { hidePopover: () => void }
const mediaPopovers = useTemplateRef<PopoverRef[]>('mediaPopovers')

const isEditingText = computed<boolean>(() => {
    const titleElement = document.getElementById('drawing-style-feature-title')
    const descriptionElement = document.getElementById('drawing-style-feature-description')
    return document.activeElement === titleElement || document.activeElement === descriptionElement
})

onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
})

function updateFeatureTitle(title: string): void {
    drawingStore.updateCurrentDrawingFeature(
        {
            title: title.trim(),
        },
        dispatcher
    )
    // Update the text offset if the feature is a marker
    if (drawingStore.feature.current?.featureType === EditableFeatureTypes.Marker) {
        updateTextOffset()
    }
}

// The description don't need a quick debounce as it is not displayed on the map
function updateFeatureDescription(description: string): void {
    drawingStore.updateCurrentDrawingFeature(
        {
            description: description.trim(),
        },
        dispatcher
    )
}

const debounceFeatureTitleUpdate = debounce(updateFeatureTitle, 100)
const debounceDescriptionUpdate = debounce(updateFeatureDescription, 300)

function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Delete' && !isEditingText.value) {
        onDelete()
    }
}

const coordinateFormat = computed(() => {
    return (
        allFormats.find((format: CoordinateFormat) => format.id === displayedFormatId.value) ??
        undefined
    )
})

/**
 * The length parameter must be greater than 3, because the polygon has one point twice : the first
 * and last point are both existing in the same exact space. A point would be length 2, a line would
 * be length 3. We do not consider the case where there are more than 3 points, but all in a single
 * line.
 */
const isFeatureMarker = computed<boolean>(
    () => drawingStore.feature.current?.featureType === EditableFeatureTypes.Marker
)
const isFeatureText = computed<boolean>(
    () => drawingStore.feature.current?.featureType === EditableFeatureTypes.Annotation
)
const isFeatureLinePolygon = computed<boolean>(
    () => drawingStore.feature.current?.featureType === EditableFeatureTypes.LinePolygon
)
const isFeatureMeasure = computed<boolean>(
    () => drawingStore.feature.current?.featureType === EditableFeatureTypes.Measure
)
const isLine = computed<boolean>(
    () => drawingStore.feature.current?.geometry?.type === 'LineString'
)

function onTextSizeChange(textSize: FeatureStyleSize): void {
    drawingStore.updateCurrentDrawingFeature(
        {
            textSize,
        },
        dispatcher
    )
    updateTextOffset()
}
function onPlacementChange(textPlacement: TextPlacement): void {
    drawingStore.updateCurrentDrawingFeature(
        {
            textPlacement,
        },
        dispatcher
    )
    updateTextOffset()
    if (drawingStore.edit.preferred.textPlacement !== textPlacement) {
        drawingStore.updateDrawingPreferences(
            {
                textPlacement,
            },
            dispatcher
        )
    }
}
function onTextColorChange(textColor: FeatureStyleColor): void {
    drawingStore.updateCurrentDrawingFeature(
        {
            textColor,
        },
        dispatcher
    )
}
function onColorChange(color: FeatureStyleColor): void {
    drawingStore.updateCurrentDrawingFeature(
        {
            fillColor: color,
        },
        dispatcher
    )
    if (drawingStore.edit.preferred.color !== color) {
        drawingStore.updateDrawingPreferences(
            {
                color: color,
            },
            dispatcher
        )
    }
}
function onIconChange(icon: DrawingIcon): void {
    drawingStore.updateCurrentDrawingFeature(
        {
            icon,
        },
        dispatcher
    )
    updateTextOffset()
}
function onIconSizeChange(iconSize: FeatureStyleSize): void {
    drawingStore.updateCurrentDrawingFeature(
        {
            iconSize,
        },
        dispatcher
    )
    updateTextOffset()
    if (drawingStore.edit.preferred.size !== iconSize) {
        drawingStore.updateDrawingPreferences(
            {
                size: iconSize,
            },
            dispatcher
        )
    }
}
function onDelete(): void {
    if (drawingStore.feature.current?.id) {
        drawingStore.deleteDrawingFeature(drawingStore.feature.current, dispatcher)
    }
}
function onAddMediaLink(mediaPopoverIndex: number, descriptionMediaLink?: string): void {
    mediaPopovers.value?.[mediaPopoverIndex]?.hidePopover()
    // Prevent 'undefined' to be added to the description
    if (descriptionMediaLink) {
        if (description.value) {
            description.value += descriptionMediaLink
        } else {
            description.value = descriptionMediaLink
        }
    }
}

function updateTextOffset(): void {
    if (
        drawingStore.feature.current &&
        isFeatureMarker.value &&
        drawingStore.feature.current.textSize &&
        drawingStore.feature.current.iconSize &&
        drawingStore.feature.current.icon
    ) {
        drawingStore.updateCurrentDrawingFeature(
            {
                textOffset: calculateTextOffset(
                    drawingStore.feature.current.textSize.textScale,
                    drawingStore.feature.current.iconSize.iconScale,
                    drawingStore.feature.current.icon.anchor,
                    drawingStore.feature.current.icon.size,
                    drawingStore.feature.current.textPlacement,
                    title.value
                ),
            },
            dispatcher
        )
    }
}

type MediaButton = {
    type: MediaType
    buttonClassOptions: string
    icon: IconProp
    extraUrlDescription?: string
}
function mediaTypes(): MediaButton[] {
    return [
        {
            type: MediaType.Link,
            buttonClassOptions: 'rounded-0 rounded-top-2 rounded-end-0',
            icon: 'fa-link' as IconProp,
            extraUrlDescription: 'text_to_display',
        },
        {
            type: MediaType.Image,
            buttonClassOptions: 'rounded-0',
            icon: 'fa-image' as IconProp,
        },
        {
            type: MediaType.Video,
            buttonClassOptions: 'rounded-0 rounded-top-2 rounded-start-0',
            icon: 'fa-film' as IconProp,
        },
    ]
}
</script>

<template>
    <div
        v-if="drawingStore.feature.current"
        data-cy="drawing-style-popup"
    >
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
                        v-if="isFeatureMarker || isFeatureText"
                        :tooltip-content="t('display_on_map')"
                    >
                        <button
                            class="btn btn-sm btn-light d-flex align-items-center mb-2"
                            @click="showDescriptionOnMap = !showDescriptionOnMap"
                        >
                            <FontAwesomeIcon
                                :icon="
                                    showDescriptionOnMap
                                        ? 'fa-solid fa-eye'
                                        : 'fa-solid fa-eye-slash'
                                "
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
                                :icon="media.icon as string"
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
                :value="(drawingStore.feature.current.coordinates[0] as number[]).slice(0, 2)"
                :coordinate-format="coordinateFormat"
            >
                <FontAwesomeIcon
                    class="small pe-2 align-text-top"
                    icon="fas fa-map-marker-alt"
                />
            </CoordinateCopySlot>
            <FeatureAreaInfo
                v-if="drawingStore.feature.current.geometry?.type === 'Polygon'"
                :geometry="drawingStore.feature.current.geometry"
            />
        </div>
        <div class="d-flex justify-content-end align-items-center">
            <div
                v-if="!readOnly"
                class="d-flex feature-style-edit-control gap-1"
            >
                <ShowGeometryProfileButton
                    v-if="isFeatureLinePolygon || isFeatureMeasure"
                    :feature="drawingStore.feature.current"
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
                                :current-size="drawingStore.feature.current.textSize"
                                @change="onTextSizeChange"
                            />
                            <DrawingStylePositionSelector
                                v-if="isFeatureMarker"
                                class="mb-3"
                                :current-placement="drawingStore.feature.current.textPlacement"
                                @change="onPlacementChange"
                            />
                            <DrawingStyleTextColorSelector
                                :current-color="drawingStore.feature.current.textColor"
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
                            @change-icon="onIconChange"
                            @change-icon-color="onColorChange"
                            @change-icon-size="onIconSizeChange"
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
                            :current-color="drawingStore.feature.current.fillColor"
                            @change="onColorChange"
                        />
                    </DrawingStylePopoverButton>
                </GeoadminTooltip>
                <GeoadminTooltip :tooltip-content="t('draw_delete')">
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
