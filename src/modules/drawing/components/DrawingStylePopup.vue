<template>
    <div v-if="feature" class="card drawing-style-popup">
        <div class="arrow-top"></div>
        <div class="card-header">
            <span class="float-left">{{ $t('draw_popup_title_feature') }}</span>
            <button type="button" class="close" aria-label="Close" @click="onClose">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="card-body text-left">
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
                <div class="form-group p-0 button-bar">
                    <geometry-measure :geometry="featureGeometry"></geometry-measure>
                    <button type="button" class="btn btn-default" @click="onDelete">
                        <font-awesome-icon :icon="['far', 'trash-alt']" />
                    </button>
                    <button
                        v-if="isFeatureMarker || isFeatureText"
                        ref="textStylePopoverBtn"
                        type="button"
                        class="btn btn-default text-style"
                    >
                        <font-awesome-icon :icon="['fas', 'font']" />
                    </button>
                </div>
                <div
                    v-if="isFeatureMarker || isFeatureText"
                    ref="textStylePopover"
                    class="text-style-popover"
                    style="display: none"
                >
                    <text-style-popup
                        :options="textStyleOptions"
                        :feature="feature"
                        @colorChange="onColorChange"
                        @sizeChange="onSizeChange"
                        @close="() => textStylePopover.popover('hide')"
                    />
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import GeometryMeasure from './GeometryMeasure.vue'
import TextStylePopup from './TextStylePopup.vue'
import jquery from 'jquery'

// Display a popup on the map when a drawing is selected.
// The popup has a form with the drawing's properties (text, description) and
// some styling configuration.
export default {
    components: { GeometryMeasure, TextStylePopup },
    props: {
        feature: {
            type: Object,
            default: null,
        },
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
        featureGeometry: {
            get() {
                return this.feature.getGeometry()
            },
        },
        isFeatureMarker: {
            get() {
                return this.feature.get('type') === 'MARKER'
            },
        },
        isFeatureText: {
            get() {
                return this.feature.get('type') === 'TEXT'
            },
        },
    },
    beforeMount() {
        this.textStyleOptions = {
            colors: [
                { name: 'black', fill: '#000000', border: 'white' },
                { name: 'blue', fill: '#0000ff', border: 'white' },
                { name: 'gray', fill: '#808080', border: 'white' },
                { name: 'green', fill: '#008000', border: 'white' },
                { name: 'orange', fill: '#ffa500', border: 'black' },
                { name: 'red', fill: '#ff0000', border: 'white' },
                { name: 'white', fill: '#ffffff', border: 'black' },
                { name: 'yellow', fill: '#ffff00', border: 'black' },
            ],
            textSizes: [
                { label: 'small_size', scale: 1 },
                { label: 'medium_size', scale: 1.5 },
                { label: 'big_size', scale: 2 },
            ],
        }
    },
    updated() {
        if (this.$refs.textStylePopoverBtn && !this.textStylePopover) {
            this.textStylePopover = jquery(this.$refs.textStylePopoverBtn).popover({
                trigger: 'click',
                html: true,
                content: this.$refs.textStylePopover.firstElementChild,
            })
        }
        if (!this.feature && this.textStylePopover) {
            this.textStylePopover.popover('hide')
            this.textStylePopover = null
        }
    },
    methods: {
        onClose: function () {
            this.$emit('close')
        },
        onDelete: function () {
            this.$emit('delete')
        },
        onColorChange(color) {
            this.feature.set('color', color.fill)
            this.feature.set('strokeColor', color.border)
            this.$emit('updateProperties')
        },
        onSizeChange(scale) {
            this.feature.set('textScale', scale)
            this.$emit('updateProperties')
        },
    },
}
</script>

<style lang="scss">
.drawing-style-popup {
    width: 320px;
    position: absolute;
    z-index: 1000;

    .card-header {
        font-size: 14px;
        padding: 8px 14px;
    }

    .card-body {
        padding: 9px 14px;
        font-size: 12px;

        button {
            width: 44px;
            height: 34px;
            margin-left: 5px;
            float: right;
            background-color: #e6e6e6;
            border-color: #ccc;
            color: #333;

            &:hover {
                border-color: #adadad;
                background-color: #cdcdcd;
            }
        }

        .form-group {
            margin-bottom: 5px;
        }

        .button-bar {
            line-height: 34px;
            margin-bottom: 0;
        }
    }

    .form-control {
        font-size: 12px;
    }

    .btn-default {
        background-color: lightgrey;

        svg {
            height: 10px;
            vertical-align: initial;
        }
    }

    label {
        margin-bottom: 5px;
        font-weight: 700;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }

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
}
</style>
