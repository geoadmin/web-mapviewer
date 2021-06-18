<template>
    <div class="marker-style-popup">
        <button type="button" class="close" @click="onClose">
            <span aria-hidden="true">&times;</span>
        </button>
        <div class="twosettings-container">
            <Size
                :sizes="options.sizes"
                :scale="feature.get('markerScale')"
                @sizeChange="onSizeChange"
            ></Size>
            <div class="setting-container">
                <span>{{ $t('modify_icon_label') }}:</span>
                <br />
                <div class="btn-group">
                    <button
                        class="btn btn-primary btn-sm dropdown-toggle dropdown-modification"
                        data-cy="symbols-button"
                        type="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        {{ currentIconsetName }}
                    </button>
                    <div class="dropdown-menu" data-cy="symbols-choices">
                        <div
                            v-for="c in iconsets"
                            :key="c.name"
                            class="dropdown-item"
                            :class="{ selected: currentIconsetName === c.name }"
                            @click="() => onIconsetChange(c)"
                        >
                            <div>{{ c.name }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Color
            v-if="currentIconset && currentIconset.colorable"
            :colors="options.colors"
            :current-color="markerColor"
            @onColorChange="onColorChange"
        ></Color>

        <div v-if="coloredIcons" class="setting-container">
            <span>{{ $t('modify_icon_label') }}:</span>
            <div class="marker-icon-select-box" :class="{ 'one-line': !showAllSymbols }">
                <font-awesome-icon :icon="['fas', 'caret-down']" @click="() => onCaretClicked()" />
                <div v-for="c in coloredIcons" :key="c.name" @click="() => onIconSelected(c)">
                    <img :src="c.url" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Size from './Size.vue'
import Color from './Color.vue'
import { unlistenByKey } from 'ol/events'
import { getIcons, getIconsets } from '@/api/icon.api'

export default {
    components: { Size, Color },
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
            markerColor: '#000000',
            showAllSymbols: false,
            iconsets: [],
            icons: [],
            currentIconset: undefined,
        }
    },
    computed: {
        currentIconsetName() {
            return this.currentIconset ? this.currentIconset.name : ''
        },
        coloredIcons() {
            if (!this.currentIconset || !this.currentIconset.colorable || !this.markerColor) {
                return this.icons
            }
            const color = this.options.colors.find((c) => this.markerColor === c.fill)
            return this.icons.map((i) => ({
                name: i.name,
                urlTemplate: i.url,
                url: this.colorizeTemplate(i.url, color),
            }))
        },
    },
    beforeMount() {
        const sizeOption = this.options.sizes.find((s) => s.scale === this.feature.get('textScale'))
        this.sizeLabel = sizeOption.label
        getIconsets().then((iconsets) => {
            this.iconsets = iconsets
            this.onIconsetChange(this.iconsets[1])
        })
        this.markerColor = this.feature.get('markerColor')
        this.changeKey = this.feature.on('propertychange', () => {
            this.$forceUpdate()
        })
    },
    beforeDestroy() {
        unlistenByKey(this.changeKey)
        this.changeKey = null
    },
    methods: {
        colorizeTemplate(template, color) {
            const rgb = color.rgb.slice(0, 3)
            return template.replace('255,0,0', rgb.join(','))
        },
        onCaretClicked() {
            this.showAllSymbols = !this.showAllSymbols
        },
        onColorChange(color) {
            this.markerColor = color.fill
            this.feature.set('markerColor', this.markerColor)
            const template = this.feature.get('iconTemplate')
            this.feature.set('icon', this.colorizeTemplate(template, color))
            this.$emit('updateProperties')
        },
        onSizeChange(size) {
            this.sizeLabel = size.label
            this.feature.set('markerScale', size.scale)
            this.$emit('updateProperties')
            this.$forceUpdate()
        },
        onClose() {
            this.$emit('close')
        },
        onIconsetChange(iconset) {
            this.icons = []
            this.currentIconset = iconset
            getIcons(iconset.icons_url).then((icons) => {
                this.icons = icons
            })
        },
        onIconSelected(icon) {
            this.feature.set('icon', icon.url)
            this.feature.set('iconTemplate', icon.template)
            this.$emit('updateProperties')
        },
    },
}
</script>

<style lang="scss">
.marker-style-popup {
    font-weight: 700;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 12px;
    color: #2c3e50;
    overflow: auto;
    width: 255px;
    max-height: 225px;

    .btn.btn-primary.dropdown-toggle.dropdown-modification {
        background-color: white;
        color: black;
        margin-bottom: 5px;
    }

    svg {
        transform: rotate(180deg);
    }

    .marker-icon-select-box {
        max-height: 2500px; // some big number
        &.one-line {
            max-height: 36px;

            svg {
                transform: rotate(0deg);
            }
        }

        display: flex;
        flex-wrap: wrap;
        background-color: rgba(0, 0, 0, 0.08);
        position: relative;
        overflow-x: clip;
        transition: max-height 0.5s linear;

        img {
            cursor: pointer;
            width: 36px;
            height: 36px;
        }

        svg {
            cursor: pointer;
            position: absolute;
            top: 0;
            right: 0;
            width: 36px !important;
            height: 36px;
            padding: 10px;
            transition: transform 0.5s ease;
        }
    }

    .dropdown-item {
        cursor: pointer;
    }

    .twosettings-container {
        display: flex;

        .setting-container {
            padding-right: 1em;
        }
    }
}
</style>
