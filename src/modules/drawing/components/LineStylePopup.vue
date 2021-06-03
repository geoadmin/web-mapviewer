<template>
    <div class="line-style-popup">
        <button type="button" class="close" @click="onClose">
            <span aria-hidden="true">&times;</span>
        </button>

        <Color
            :current-color="color"
            :colors="options.colors"
            @onColorChange="onColorChange"
        ></Color>
    </div>
</template>

<script>
import Color from './Color.vue'

export default {
    components: { Color },
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
    data: function () {
        return {
            color: this.feature.get('color'),
        }
    },
    methods: {
        onColorChange(color) {
            this.color = color.fill
            this.feature.set('color', this.color)
            this.$emit('updateProperties')
        },
        onClose() {
            this.$emit('close')
        },
    },
}
</script>

<style lang="scss">
.line-style-popup {
    font-weight: 700;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 12px;
    color: #2c3e50;
    overflow: auto;
    width: 255px;
    max-height: 225px;
}
</style>
