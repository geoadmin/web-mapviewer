<template>
    <div data-cy="drawing-style-popup">
        <div v-if="isFeatureMarker || isFeatureText" class="form-group mb-2">
            <label class="form-label" for="drawing-style-feature-title">
                {{ $t('draw_popup_title_annotation') }}
            </label>
            <textarea
                id="drawing-style-feature-title"
                v-model="text"
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
                data-cy="drawing-style-feature-description"
                class="form-control"
                rows="2"
            ></textarea>
        </div>

        <div class="d-flex justify-content-between align-items-center">
            <SelectedFeatureProfile :feature="feature" />

            <div class="d-flex justify-content-end margin-between-children">
                <PopoverButton
                    v-if="isFeatureMarker || isFeatureText"
                    data-cy="drawing-style-text-button"
                    with-close-button
                    popover-position="top"
                    :button-font-awesome-icon="['fas', 'font']"
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
                </PopoverButton>

                <PopoverButton
                    v-if="isFeatureMarker"
                    data-cy="drawing-style-marker-button"
                    with-close-button
                    popover-position="top"
                    :button-font-awesome-icon="['fas', 'map-marker-alt']"
                >
                    <DrawingStyleIconSelector
                        data-cy="drawing-style-marker-popup"
                        :feature="feature"
                        :icon-sets="availableIconSets"
                        @change:icon="onIconChange"
                        @change:icon-color="onColorChange"
                        @change:icon-size="onIconSizeChange"
                    />
                </PopoverButton>

                <PopoverButton
                    v-if="isFeatureLine"
                    data-cy="drawing-style-line-button"
                    popover-position="top"
                    with-close-button
                    :popover-title="$t('modify_color_label')"
                    :button-font-awesome-icon="['fas', 'paint-brush']"
                >
                    <DrawingStyleColorSelector
                        data-cy="drawing-style-line-popup"
                        @change="onColorChange"
                    />
                </PopoverButton>

                <ButtonWithIcon
                    :button-font-awesome-icon="['far', 'trash-alt']"
                    @click="onDelete"
                ></ButtonWithIcon>
            </div>
        </div>
    </div>
</template>

<script>
import { EditableFeature, EditableFeatureTypes } from '@/api/features.api'
import DrawingStyleColorSelector from '@/modules/infobox/components/styling/DrawingStyleColorSelector.vue'
import DrawingStyleIconSelector from '@/modules/infobox/components/styling/DrawingStyleIconSelector.vue'
import DrawingStyleSizeSelector from '@/modules/infobox/components/styling/DrawingStyleSizeSelector.vue'
import DrawingStyleTextColorSelector from '@/modules/infobox/components/styling/DrawingStyleTextColorSelector.vue'
import SelectedFeatureProfile from '@/modules/infobox/components/styling/SelectedFeatureProfile.vue'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import { allStylingColors, allStylingSizes } from '@/utils/featureStyleUtils'
import PopoverButton from '@/utils/PopoverButton.vue'
import { mapActions } from 'vuex'

/**
 * Display a popup on the map when a drawing is selected.
 *
 * The popup has a form with the drawing's properties (text, description) and some styling configuration.
 */
export default {
    components: {
        DrawingStyleColorSelector,
        DrawingStyleTextColorSelector,
        DrawingStyleSizeSelector,
        DrawingStyleIconSelector,
        ButtonWithIcon,
        PopoverButton,
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
            const id = this.feature.id.replace('drawing_feature_', '')
            this.deleteDrawingFeature(id)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/variables';

.drawing-style-popup {
    min-width: 320px;
    position: absolute;
    z-index: 1000;

    .arrow-top::after {
        display: block;
        content: ' ';
        position: absolute;
        left: 149px;
        top: -10px;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 10px 10px 10px;
        z-index: 1000;
        border-color: transparent transparent #f7f7f7 transparent;
    }
    .margin-between-children > :not(:last-child) {
        margin-right: 5px;
    }
}
</style>
