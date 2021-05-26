<template>
    <div class="text-style-popup">
        <button type="button" class="close" @click="onClose">
            <span aria-hidden="true">&times;</span>
        </button>
        <div class="setting-container">
            <span>{{ $t('modify_text_size_label') }}:</span>
            <br />
            <div class="btn-group">
                <button
                    class="btn btn-primary btn-sm dropdown-toggle dropdown-modification text-size-select"
                    type="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                >
                    {{ $t(sizeLabel) }}
                </button>
                <div class="dropdown-menu">
                    <a
                        v-for="size in options.textSizes"
                        :key="size.label"
                        href="#"
                        class="dropdown-item"
                        @click="() => onSizeChange(size)"
                        >{{ $t(size.label) }}
                    </a>
                </div>
            </div>
        </div>
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
                            'text-shadow':
                                '-1px -1px 0 ' +
                                c.border +
                                ',' +
                                '1px -1px 0 ' +
                                c.border +
                                ',' +
                                '-1px 1px 0 ' +
                                c.border +
                                ',' +
                                '1px 1px 0 ' +
                                c.border,
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
export default {
    components: {},
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
        onColorChange: function (color) {
            this.$emit('colorChange', color)
            this.$forceUpdate()
        },
        onSizeChange: function (size) {
            this.sizeLabel = size.label
            this.$emit('sizeChange', size.scale)
            this.$forceUpdate()
        },
        onClose: function () {
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