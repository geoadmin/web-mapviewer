<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { DrawingIcon, DrawingIconSet } from '@/api/icon.api'
import type { DropdownItem } from '@/utils/components/DropdownButton.vue'
import type { FeatureStyleColor, FeatureStyleSize } from '@/utils/featureStyleUtils'

import { DEFAULT_ICON_SET_NAME } from '@/config/icons.config'
import DrawingStyleColorSelector from '@/modules/infobox/components/styling/DrawingStyleColorSelector.vue'
import DrawingStyleIcon from '@/modules/infobox/components/styling/DrawingStyleIcon.vue'
import DrawingStyleSizeSelector from '@/modules/infobox/components/styling/DrawingStyleSizeSelector.vue'
import useDrawingStore from '@/store/modules/drawing'
import DropdownButton from '@/utils/components/DropdownButton.vue'

const emits = defineEmits<{
    change: [void]
    changeIconSize: [size: FeatureStyleSize]
    changeIcon: [icon: DrawingIcon]
    changeIconColor: [color: FeatureStyleColor]
}>()

const { t } = useI18n()

const drawingStore = useDrawingStore()

const showAllSymbols = ref<boolean>(false)
const currentIconSet = ref<DrawingIconSet | undefined>()
const loadedImages = ref<number>(0)

const currentIconSetName = computed(() => {
    if (currentIconSet.value) {
        return t(`modify_icon_category_${currentIconSet.value.name}_label`, 1, {
            locale: currentIconSet.value.language,
        })
    }
    return ''
})

const iconSetDropdownItems = computed<DropdownItem<DrawingIconSet>[]>(() => {
    return drawingStore.iconSets.map((iconSet) => {
        return {
            id: iconSet.name,
            title: t(`modify_icon_category_${iconSet.name}_label`, 1, {
                locale: iconSet.language,
            }),
            value: iconSet,
            description: `modify_icon_category_${iconSet.name}_label`,
        }
    })
})

onMounted(() => {
    const iconSetNameToLookup =
        drawingStore.feature.current?.icon?.iconSetName ?? DEFAULT_ICON_SET_NAME
    currentIconSet.value =
        drawingStore.iconSets.find((iconSet) => iconSet.name === iconSetNameToLookup) ??
        drawingStore.iconSets.find((iconSet) => iconSet.name === DEFAULT_ICON_SET_NAME)
})

function toggleShowAllSymbols() {
    showAllSymbols.value = !showAllSymbols.value
}

function onCurrentIconColorChange(color: FeatureStyleColor) {
    emits('changeIconColor', color)
    emits('change')
}

function onCurrentIconSizeChange(size: FeatureStyleSize) {
    emits('changeIconSize', size)
    emits('change')
}

function changeDisplayedIconSet(dropdownItem: DropdownItem<DrawingIconSet>) {
    currentIconSet.value = dropdownItem.value
}

function onImageLoad() {
    loadedImages.value = loadedImages.value + 1
    if (
        currentIconSet.value?.icons?.length &&
        loadedImages.value === currentIconSet.value.icons.length
    ) {
        loadedImages.value = 0
    }
}

function onCurrentIconChange(icon: DrawingIcon) {
    showAllSymbols.value = true
    emits('changeIcon', icon)
    emits('change')
}
</script>

<template>
    <div class="d-block">
        <div
            v-if="
                currentIconSet &&
                drawingStore.feature.current &&
                drawingStore.feature.current.iconSize
            "
            class="d-flex mb-3"
        >
            <DrawingStyleSizeSelector
                :current-size="drawingStore.feature.current.iconSize"
                @change="onCurrentIconSizeChange"
            />
            <div class="ms-2">
                <label
                    class="form-label"
                    for="drawing-style-icon-set-selector"
                >
                    {{ t('modify_icon_label') }}
                </label>
                <DropdownButton
                    :title="currentIconSetName"
                    :items="iconSetDropdownItems"
                    :current-value="currentIconSet"
                    data-cy="drawing-style-icon-set-button"
                    @select-item="changeDisplayedIconSet"
                />
            </div>
        </div>
        <DrawingStyleColorSelector
            v-if="
                currentIconSet &&
                drawingStore.feature.current &&
                currentIconSet.isColorable &&
                drawingStore.feature.current.fillColor
            "
            class="mb-3"
            inline
            :current-color="drawingStore.feature.current.fillColor"
            @change="onCurrentIconColorChange"
        />

        <div
            v-if="currentIconSet && currentIconSet.icons.length > 0"
            class="icon-selector bg-light rounded border border-gray-300"
            :class="{ 'transparent-bottom': !showAllSymbols }"
        >
            <div
                class="d-flex align-items-center rounded p-2"
                data-cy="drawing-style-toggle-all-icons-button"
                @click="toggleShowAllSymbols()"
            >
                <div>{{ t('modify_icon_label') }}</div>
                <font-awesome-icon
                    :icon="['fas', showAllSymbols ? 'caret-down' : 'caret-right']"
                    class="ms-2"
                />
            </div>
            <div
                class="marker-icon-select-box"
                :class="{ 'one-line': !showAllSymbols }"
            >
                <DrawingStyleIcon
                    v-for="icon in currentIconSet.icons"
                    :key="icon.name"
                    ref="iconButtons"
                    :tooltip-disabled="!showAllSymbols"
                    :icon="icon"
                    :current-icon-set="currentIconSet"
                    @change-icon="onCurrentIconChange"
                    @load="onImageLoad"
                />
            </div>
            <div
                class="transparent-overlay"
                @click="showAllSymbols = true"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.icon-selector {
    overflow-y: hidden;
}
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
        pointer-events: none;
    }
}
.marker-icon-select-box {
    max-height: 10rem;
    overflow-y: scroll;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    transition: max-height 0.3s linear;
    &.one-line {
        max-height: 2rem;
        overflow-y: hidden;
    }
}
</style>
