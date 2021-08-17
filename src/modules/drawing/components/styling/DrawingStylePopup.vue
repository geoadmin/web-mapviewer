<template>
    <div v-if="feature && !isFeatureMeasure" class="card drawing-style-popup">
        <div class="arrow-top"></div>
        <div class="card-header d-flex justify-content-between align-items-center">
            <span>{{ $t('draw_popup_title_feature') }}</span>
            <ButtonWithIcon
                class="close float-end"
                :button-font-awesome-icon="['fa', 'times']"
                small
                @click="onClose"
            />
        </div>
        <div class="card-body text-start">
            <form>
                <div v-if="featureGeometry.getType() === 'Point'" class="form-group mb-2">
                    <label class="form-label" for="drawing-style-feature-title">
                        {{ $t('draw_popup_title_annotation') }}
                    </label>
                    <textarea
                        id="drawing-style-feature-title"
                        v-model="text"
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
                        class="form-control"
                        rows="2"
                    ></textarea>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <geometry-measure :geometry="featureGeometry"></geometry-measure>
                    <div class="d-flex justify-content-end margin-between-children">
                        <PopoverButton
                            v-if="isFeatureMarker || isFeatureText"
                            with-close-button
                            :button-font-awesome-icon="['fas', 'font']"
                        >
                            <DrawingStyleSizeSelector
                                class="mb-3"
                                :current-size="currentTextSize"
                                @sizeChange="setCurrentTextSize"
                            />
                            <DrawingStyleTextColorSelector :feature="feature" />
                        </PopoverButton>
                        <PopoverButton
                            v-if="isFeatureMarker"
                            with-close-button
                            :button-font-awesome-icon="['fas', 'map-marker-alt']"
                        >
                            <DrawingStyleIconSelector
                                :feature="feature"
                                :icon-sets="availableIconSets"
                            />
                        </PopoverButton>
                        <PopoverButton
                            v-if="isFeatureLine"
                            ref="lineStylePopover"
                            with-close-button
                            :popover-title="$t('modify_color_label')"
                            :button-font-awesome-icon="['fas', 'paint-brush']"
                        >
                            <DrawingStyleColorSelector :feature="feature" />
                        </PopoverButton>
                        <ButtonWithIcon
                            :button-font-awesome-icon="['far', 'trash-alt']"
                            @click="onDelete"
                        ></ButtonWithIcon>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import GeometryMeasure from '@/modules/drawing/components/styling/GeometryMeasure.vue'
import { drawingStyleColors } from '@/modules/drawing/components/styling/drawingStyleColor'
import { drawingStyleSizes } from '@/modules/drawing/components/styling/drawingStyleSizes'
import PopoverButton from '@/utils/PopoverButton'
import ButtonWithIcon from '@/utils/ButtonWithIcon'
import DrawingStyleColorSelector from '@/modules/drawing/components/styling/DrawingStyleColorSelector'
import DrawingStyleIconSelector from '@/modules/drawing/components/styling/DrawingStyleIconSelector'
import DrawingStyleSizeSelector from '@/modules/drawing/components/styling/DrawingStyleSizeSelector'
import DrawingStyleTextColorSelector from '@/modules/drawing/components/styling/DrawingStyleTextColorSelector'

/**
 * Display a popup on the map when a drawing is selected.
 *
 * The popup has a form with the drawing's properties (text, description) and some styling configuration.
 */
export default {
    components: {
        DrawingStyleTextColorSelector,
        DrawingStyleSizeSelector,
        DrawingStyleIconSelector,
        DrawingStyleColorSelector,
        ButtonWithIcon,
        PopoverButton,
        GeometryMeasure,
    },
    props: {
        feature: {
            type: Object,
            default: null,
        },
        availableIconSets: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            colors: drawingStyleColors,
            sizes: drawingStyleSizes,
            currentTextSize: drawingStyleSizes[0],
        }
    },
    computed: {
        description: {
            get() {
                return this.feature.get('description')
            },
            set(value) {
                this.feature.set('description', value)
                this.$emit('updateProperties')
            },
        },
        text: {
            get() {
                return this.feature.get('text')
            },
            set(value) {
                this.feature.set('text', value)
                this.$emit('updateProperties')
            },
        },
        featureGeometry() {
            return this.feature.getGeometry()
        },
        isFeatureMarker() {
            return this.feature.get('type') === 'MARKER'
        },
        isFeatureText() {
            return this.feature.get('type') === 'TEXT'
        },
        isFeatureLine() {
            return this.feature.get('type') === 'LINE'
        },
        isFeatureMeasure() {
            return this.feature.get('type') === 'MEASURE'
        },
    },
    watch: {
        /**
         * Whenever the text size is edited, we replicate this change on the feature by editing the
         * text textScale
         *
         * @param {DrawingStyleSize} newSize
         */
        currentTextSize: function (newSize) {
            if (newSize) {
                this.feature.set('textScale', newSize.textScale)
            }
        },
        feature: function (newFeature) {
            if (newFeature) {
                const currentTextScale = newFeature.get('textScale')
                this.currentTextSize = this.sizes.find(
                    (size) => size.textScale === currentTextScale
                )
            }
        },
    },
    methods: {
        updateProperties() {
            this.$emit('updateProperties')
        },
        onClose: function () {
            this.$emit('close')
        },
        onDelete: function () {
            this.$emit('delete')
        },
        setCurrentTextSize: function (size) {
            this.currentTextSize = size
        },
    },
}
</script>

<style lang="scss">
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
