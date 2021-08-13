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
                <div v-if="featureGeometry.getType() === 'Point'" class="form-group">
                    <label for="text">{{ $t('draw_popup_title_annotation') }}:</label>
                    <textarea id="text" v-model="text" class="form-control" rows="1"></textarea>
                </div>
                <div v-if="!isFeatureText" class="form-group">
                    <label for="description">{{ $t('modify_description') }}:</label>
                    <textarea
                        id="description"
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
                            ref="textStylePopover"
                            :button-font-awesome-icon="['fas', 'font']"
                        >
                            <TextStylePopup
                                :options="textStyleOptions"
                                :feature="feature"
                                @updateProperties="updateProperties"
                                @close="() => $refs.textStylePopover.hidePopover()"
                            />
                        </PopoverButton>
                        <PopoverButton
                            v-if="isFeatureMarker"
                            ref="markerStylePopover"
                            :button-font-awesome-icon="['fas', 'map-marker-alt']"
                        >
                            <MarkerStylePopup
                                :options="markerStyleOptions"
                                :feature="feature"
                                @updateProperties="updateProperties"
                                @close="() => $refs.markerStylePopover.hidePopover()"
                            />
                        </PopoverButton>
                        <PopoverButton
                            v-if="isFeatureLine"
                            ref="lineStylePopover"
                            :button-font-awesome-icon="['fas', 'paint-brush']"
                        >
                            <LineStylePopup
                                :options="lineStyleOptions"
                                :feature="feature"
                                @updateProperties="updateProperties"
                                @close="() => $refs.lineStylePopover.hidePopover()"
                            />
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
import GeometryMeasure from './GeometryMeasure.vue'
import TextStylePopup from './TextStylePopup.vue'
import MarkerStylePopup from './MarkerStylePopup.vue'
import LineStylePopup from './LineStylePopup.vue'
import { fromString } from 'ol/color'
import PopoverButton from '@/utils/PopoverButton'
import ButtonWithIcon from '@/utils/ButtonWithIcon'

const colors = [
    { name: 'black', fill: '#000000', border: 'white' },
    { name: 'blue', fill: '#0000ff', border: 'white' },
    { name: 'gray', fill: '#808080', border: 'white' },
    { name: 'green', fill: '#008000', border: 'white' },
    { name: 'orange', fill: '#ffa500', border: 'black' },
    { name: 'red', fill: '#ff0000', border: 'white' },
    { name: 'white', fill: '#ffffff', border: 'black' },
    { name: 'yellow', fill: '#ffff00', border: 'black' },
]
colors.forEach((c) => (c.rgb = fromString(c.fill)))
const sizes = [
    { label: 'small_size', scale: 1 },
    { label: 'medium_size', scale: 1.5 },
    { label: 'big_size', scale: 2 },
]

/**
 * Display a popup on the map when a drawing is selected.
 *
 * The popup has a form with the drawing's properties (text, description) and some styling configuration.
 */
export default {
    components: {
        ButtonWithIcon,
        PopoverButton,
        GeometryMeasure,
        TextStylePopup,
        MarkerStylePopup,
        LineStylePopup,
    },
    props: {
        feature: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            textStyleOptions: {
                colors,
                sizes: sizes,
            },
            markerStyleOptions: {
                colors,
                sizes: sizes,
            },
            lineStyleOptions: {
                colors,
            },
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
