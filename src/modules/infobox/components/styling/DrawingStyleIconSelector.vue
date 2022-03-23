<template>
    <div class="d-block">
        <div class="d-flex mb-3">
            <DrawingStyleSizeSelector
                :current-size="feature.iconSize"
                @change="onCurrentIconSizeChange"
            />
            <div class="ms-2">
                <label class="form-label" for="drawing-style-icon-set-selector">
                    {{ $t('modify_icon_label') }}
                </label>
                <div id="drawing-style-icon-set-selector" class="dropdown">
                    <button
                        id="dropdown-icon-set-selector"
                        data-cy="drawing-style-icon-set-button"
                        class="btn btn-light dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        {{ currentIconSetName }}
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdown-size-selector">
                        <li>
                            <a
                                v-for="iconSet in iconSets"
                                :key="iconSet.name"
                                class="dropdown-item"
                                :class="{ active: currentIconSetName === iconSet.name }"
                                :data-cy="`drawing-style-icon-set-selector-${iconSet.name}`"
                                @click="setCurrentIconSet(iconSet)"
                            >
                                {{ iconSet.name }}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <DrawingStyleColorSelector
            v-if="currentIconSet && currentIconSet.isColorable"
            class="mb-3"
            inline
            @change="onCurrentIconColorChange"
        />

        <div
            v-if="currentIconSet && currentIconSet.icons.length > 0"
            class="border-2 bg-light"
            :class="{ 'transparent-bottom': !showAllSymbols }"
        >
            <div
                class="bg-light d-flex align-content-center p-2"
                data-cy="drawing-style-show-all-icons-button"
                @click="showAllSymbols = !showAllSymbols"
            >
                {{ $t('modify_icon_label') }}
                &nbsp;
                <font-awesome-icon :icon="['fas', showAllSymbols ? 'caret-down' : 'caret-right']" />
            </div>
            <div class="marker-icon-select-box" :class="{ 'one-line': !showAllSymbols }">
                <img
                    v-for="icon in currentIconSet.icons"
                    :key="icon.name"
                    :alt="icon.name"
                    :src="generateColorizedURL(icon)"
                    :data-cy="`drawing-style-icon-selector-${icon.name}`"
                    class="marker-icon-image"
                    crossorigin="anonymous"
                    @click="showAllSymbols && onCurrentIconChange(icon)"
                />
            </div>
            <div class="transparent-overlay" @click="showAllSymbols = true" />
        </div>
    </div>
</template>

<script>
import { EditableFeature } from '@/api/features.api'
import DrawingStyleSizeSelector from '@/modules/infobox/components/styling/DrawingStyleSizeSelector.vue'
import DrawingStyleColorSelector from '@/modules/infobox/components/styling/DrawingStyleColorSelector.vue'
import { MEDIUM } from '@/utils/featureStyleUtils'

export default {
    components: { DrawingStyleSizeSelector, DrawingStyleColorSelector },
    props: {
        feature: {
            type: EditableFeature,
            required: true,
        },
        iconSets: {
            type: Array,
            required: true,
        },
    },
    emits: ['change', 'change:iconSize', 'change:icon', 'change:iconColor'],
    data: function () {
        return {
            showAllSymbols: false,
            currentIconSet: null,
            // we store it because we don't want the selection window's icon to change size
            // only the icon on the map should
            defaultIconSize: MEDIUM,
        }
    },
    computed: {
        currentIconSetName() {
            return this.currentIconSet ? this.currentIconSet.name : ''
        },
    },
    mounted() {
        const iconSetNameToLookup = this.feature?.icon ? this.feature.icon.iconSetName : 'default'
        this.currentIconSet = this.iconSets.find((iconSet) => iconSet.name === iconSetNameToLookup)
    },
    methods: {
        /**
         * Generate an icon URL with medium size (so that the size doesn't change in the icon
         * selector, even when the user selects a different size for the icon the map)
         *
         * @param {Icon} icon
         * @returns {String} An icon URL
         */
        generateColorizedURL(icon) {
            return icon.generateURL(MEDIUM, this.feature.fillColor)
        },
        onCurrentIconColorChange(color) {
            this.$emit('change:iconColor', color)
            this.$emit('change')
        },
        onCurrentIconChange(icon) {
            this.$emit('change:icon', icon)
            this.$emit('change')
        },
        onCurrentIconSizeChange(size) {
            this.$emit('change:iconSize', size)
            this.$emit('change')
        },
        setCurrentIconSet(iconSet) {
            this.currentIconSet = iconSet
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.transparent-overlay {
    display: none;
}
.transparent-bottom {
    position: relative;
    .transparent-overlay {
        display: block;
        position: absolute;
        width: 100%;
        height: 2rem;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, $light 100%);
        bottom: 0;
    }
}
.marker-icon-select-box {
    max-height: 15rem;
    overflow-y: scroll;
    &.one-line {
        max-height: 2rem;
        overflow-y: hidden;
    }
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    transition: max-height 0.3s linear;
    .marker-icon-image {
        cursor: pointer;
        width: 3rem;
        height: 3rem;
    }
}
</style>
