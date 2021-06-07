<template>
    <div class="setting-container">
        <span>{{ $t('modify_color_label') }}:</span>
        <div class="color-select-box">
            <div
                v-for="c in colors"
                :key="c.name"
                :class="{ selected: currentColor === c.fill }"
                @click="() => onColorChange(c)"
            >
                <div :style="{ 'background-color': c.name }"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: {
        colors: {
            type: Array,
            default() {
                return []
            },
        },
        currentColor: {
            type: String,
            default: '',
        },
    },
    methods: {
        onColorChange: function (c) {
            this.$emit('onColorChange', c)
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
    background-color: rgba(0, 0, 0, 0.08);

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
        vertical-align: middle;
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
</style>