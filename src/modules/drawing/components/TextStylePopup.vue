<template>
    <div class="text-style-popup">
        <button type="button" class="close" @click="onClose">
            <span aria-hidden="true">&times;</span>
        </button>
        <Size
            :sizes="options.textSizes"
            :scale="feature.get('textScale')"
            @sizeChange="onSizeChange"
        >
        </Size>
        <div class="setting-container">
            <span>{{ $t('modify_text_color_label') }}:</span>
            <div class="color-select-box">
                <div
                    v-for="c in options.colors"
                    :key="c.name"
                    :class="{ selected: feature.get('color') === c.fill }"
                    @click="() => onColorChange(c)"
                >
                    <div
                        :style="{
                            color: c.name,
                            font: feature.get('font'),
                            'text-shadow': textShadow(c.border),
                        }"
                    >
                        Aa
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Size from './Size.vue'
export default {
    components: { Size },
    props: {
        feature: {
            type: Object,
            default: null,
        },
        options: {
            type: Object,
            default: null,
        },
    },
    computed: {},
    beforeMount() {
        const sizeOption = this.options.textSizes.find(
            (s) => s.scale === this.feature.get('textScale')
        )
        this.sizeLabel = sizeOption.label
    },
    methods: {
        /** @param {string} b Border @return string */
        textShadow(b) {
            return `-1px -1px 0 ${b}, 1px -1px 0 ${b}, -1px 1px 0 ${b},1px 1px 0 ${b}`
        },
        onColorChange(color) {
            this.feature.set('color', color.fill)
            this.feature.set('strokeColor', color.border)
            this.$emit('updateProperties')
            this.$forceUpdate()
        },
        onSizeChange(size) {
            this.sizeLabel = size.label
            this.feature.set('textScale', size.scale)
            this.$emit('updateProperties')
            this.$forceUpdate()
        },
        onClose() {
            this.$emit('close')
        },
    },
}
</script>

<style lang="scss">
.color-select-box {
    position: relative;
    overflow: hidden;
    border: 1px solid lightgray;
    border-radius: 2px;
    padding: 1px 6px 1px 6px;
    transition: height 0.5s ease;

    button {
        position: absolute;
        top: 0;
        right: 0;
        transition: transform 0.5s ease;
    }

    > :not(button) {
        display: inline-block;
        cursor: pointer;
        margin: 2px;

        &:hover {
            background-color: #e9e9e9;
        }

        &.selected,
        &.selected:hover {
            background-color: darkgray;
            cursor: default;
        }
    }

    [style] {
        width: 20px;
        height: 20px;
        margin: 2px;
        border-radius: 10px;
    }
}

.btn.btn-primary.dropdown-toggle.dropdown-modification {
    background-color: white;
    color: black;
    margin-bottom: 5px;
}

.text-style-popup {
    font-weight: 700;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 12px;
    color: #2c3e50;
}
</style>