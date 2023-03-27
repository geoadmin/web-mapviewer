<template>
    <div data-cy="drawing-style-popup">
        <div v-if="isFeatureMarker || isFeatureText" class="form-group mb-2">
            <label class="form-label" for="drawing-style-feature-title">
                {{ $t('draw_popup_title_annotation') }}
            </label>
            <textarea
                id="drawing-style-feature-title"
                v-model="text"
                :readonly="readOnly"
                data-cy="drawing-style-feature-title"
                class="form-control"
                rows="1"
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
                class="form-control"
                rows="2"
            ></textarea>
        </div>

        <div class="d-flex">
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

<script>
import { EditableFeature, EditableFeatureTypes } from '@/api/features.api'
import DrawingStyleColorSelector from '@/modules/infobox/components/styling/DrawingStyleColorSelector.vue'
import DrawingStyleIconSelector from '@/modules/infobox/components/styling/DrawingStyleIconSelector.vue'
import DrawingStylePopoverButton from '@/modules/infobox/components/styling/DrawingStylePopoverButton.vue'
import DrawingStyleSizeSelector from '@/modules/infobox/components/styling/DrawingStyleSizeSelector.vue'
import DrawingStyleTextColorSelector from '@/modules/infobox/components/styling/DrawingStyleTextColorSelector.vue'
import SelectedFeatureProfile from '@/modules/infobox/components/styling/SelectedFeatureProfile.vue'
import { allStylingColors, allStylingSizes } from '@/utils/featureStyleUtils'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mapActions } from 'vuex'

/**
 * Display a popup on the map when a drawing is selected.
 *
 * The popup has a form with the drawing's properties (text, description) and some styling
 * configuration.
 */
export default {
    components: {
        FontAwesomeIcon,
        DrawingStyleColorSelector,
        DrawingStyleTextColorSelector,
        DrawingStyleSizeSelector,
        DrawingStyleIconSelector,
        DrawingStylePopoverButton,
        SelectedFeatureProfile,
    },
    props: {
        feature: {
            type: EditableFeature,
            required: true,
        },
        availableIconSets: {
            type: Array,
            required: true,
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['close'],
    data() {
        return {
            colors: allStylingColors,
            sizes: allStylingSizes,
        }
    },
    computed: {
        currentTextSize() {
            return this.feature?.textSize
        },
        description: {
            get() {
                return this.feature.description
            },
            set(value) {
                this.changeFeatureDescription({ feature: this.feature, description: value })
            },
        },
        text: {
            get() {
                return this.feature.title
            },
            set(value) {
                this.changeFeatureTitle({ feature: this.feature, title: value })
            },
        },
        isFeatureMarker() {
            return this.feature.featureType === EditableFeatureTypes.MARKER
        },
        isFeatureText() {
            return this.feature.featureType === EditableFeatureTypes.ANNOTATION
        },
        isFeatureLine() {
            return this.feature.featureType === EditableFeatureTypes.LINEPOLYGON
        },
        isFeatureMeasure() {
            return this.feature.featureType === EditableFeatureTypes.MEASURE
        },
    },
    methods: {
        ...mapActions([
            'changeFeatureTitle',
            'changeFeatureDescription',
            'changeFeatureColor',
            'changeFeatureTextSize',
            'changeFeatureTextColor',
            'changeFeatureIcon',
            'changeFeatureIconSize',
            'deleteDrawingFeature',
        ]),
        onClose() {
            this.$emit('close')
        },
        onTextSizeChange(textSize) {
            this.changeFeatureTextSize({ feature: this.feature, textSize })
        },
        onTextColorChange(textColor) {
            this.changeFeatureTextColor({ feature: this.feature, textColor })
        },
        onColorChange(color) {
            this.changeFeatureColor({ feature: this.feature, color })
        },
        onIconChange(icon) {
            this.changeFeatureIcon({ feature: this.feature, icon })
        },
        onIconSizeChange(iconSize) {
            this.changeFeatureIconSize({ feature: this.feature, iconSize })
        },
        onDelete() {
            this.deleteDrawingFeature(this.feature.id)
        },
    },
}
</script>
