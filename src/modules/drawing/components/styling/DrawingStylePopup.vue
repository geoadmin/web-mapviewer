<template>
    <div
        v-if="feature && !isFeatureMeasure"
        class="card drawing-style-popup"
        data-cy="drawing-style-popup"
    >
        <div class="arrow-top"></div>
        <div class="card-header d-flex justify-content-between align-items-center">
            <span>{{ $t('draw_popup_title_feature') }}</span>
            <ButtonWithIcon
                class="close float-end"
                :button-font-awesome-icon="['fa', 'times']"
                data-cy="drawing-style-close-popup"
                small
                @click="onClose"
            />
        </div>
        <div class="card-body text-start">
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
                    @change="triggerChangeEvent"
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
                    @change="triggerChangeEvent"
                ></textarea>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <DrawingStyleFeatureMeasurements :feature="feature" />
                <div class="d-flex justify-content-end margin-between-children">
                    <PopoverButton
                        v-if="isFeatureMarker || isFeatureText"
                        data-cy="drawing-style-text-button"
                        with-close-button
                        :button-font-awesome-icon="['fas', 'font']"
                    >
                        <div data-cy="drawing-style-text-popup">
                            <DrawingStyleSizeSelector
                                class="mb-3"
                                :current-size="currentTextSize"
                                @change="setCurrentTextSize"
                            />
                            <DrawingStyleTextColorSelector
                                :feature="feature"
                                @change="triggerChangeEvent"
                            />
                        </div>
                    </PopoverButton>
                    <PopoverButton
                        v-if="isFeatureMarker"
                        data-cy="drawing-style-marker-button"
                        with-close-button
                        :button-font-awesome-icon="['fas', 'map-marker-alt']"
                    >
                        <DrawingStyleIconSelector
                            data-cy="drawing-style-marker-popup"
                            :feature="feature"
                            :icon-sets="availableIconSets"
                            @change="triggerChangeEvent"
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
                            @change="changeFeatureColor"
                        />
                    </PopoverButton>
                    <ButtonWithIcon
                        :button-font-awesome-icon="['far', 'trash-alt']"
                        @click="onDelete"
                    ></ButtonWithIcon>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import DrawingStyleFeatureMeasurements from '@/modules/drawing/components/styling/DrawingStyleFeatureMeasurements.vue'
import { drawingStyleColors } from '@/modules/drawing/lib/drawingStyleColor'
import { drawingStyleSizes, SMALL } from '@/modules/drawing/lib/drawingStyleSizes'
import PopoverButton from '@/utils/PopoverButton.vue'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import DrawingStyleColorSelector from '@/modules/drawing/components/styling/DrawingStyleColorSelector.vue'
import DrawingStyleIconSelector from '@/modules/drawing/components/styling/DrawingStyleIconSelector.vue'
import DrawingStyleSizeSelector from '@/modules/drawing/components/styling/DrawingStyleSizeSelector.vue'
import DrawingStyleTextColorSelector from '@/modules/drawing/components/styling/DrawingStyleTextColorSelector.vue'

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
        DrawingStyleFeatureMeasurements,
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
    emits: ['change', 'close', 'delete'],
    data() {
        return {
            colors: drawingStyleColors,
            sizes: drawingStyleSizes,
            currentTextSize: SMALL,
        }
    },
    computed: {
        description: {
            get() {
                return this.feature.get('description')
            },
            set(value) {
                this.feature.set('description', value)
                this.triggerChangeEvent()
            },
        },
        text: {
            get() {
                return this.feature.get('text')
            },
            set(value) {
                this.feature.set('text', value)
                this.triggerChangeEvent()
            },
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
        feature: function (newFeature) {
            if (newFeature) {
                const featureTextScale = parseFloat(newFeature.get('textScale'))
                if (featureTextScale) {
                    this.setCurrentTextSize(
                        this.sizes.find((size) => size.textScale === featureTextScale)
                    )
                }
            }
        },
    },
    methods: {
        triggerChangeEvent() {
            this.$emit('change')
        },
        onClose: function () {
            this.$emit('close')
        },
        onDelete: function () {
            this.$emit('delete')
        },
        setCurrentTextSize: function (size) {
            this.currentTextSize = size
            this.feature.set('textScale', size.textScale)
            this.triggerChangeEvent()
        },
        changeFeatureColor: function (color) {
            this.feature.set('color', color.fill)
            this.triggerChangeEvent()
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
