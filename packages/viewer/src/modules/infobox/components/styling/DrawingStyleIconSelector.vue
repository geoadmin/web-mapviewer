<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { EditableFeature } from '@/api/features.api'
import type { DrawingIcon, DrawingIconSet } from '@/api/icon.api'
import type { FeatureStyleColor, FeatureStyleSize } from '@/utils/featureStyleUtils'

import DrawingStyleColorSelector from '@/modules/infobox/components/styling/DrawingStyleColorSelector.vue'
import DrawingStyleIcon from '@/modules/infobox/components/styling/DrawingStyleIcon.vue'
import DrawingStyleSizeSelector from '@/modules/infobox/components/styling/DrawingStyleSizeSelector.vue'
import DropdownButton, { type DropdownItem } from '@/utils/components/DropdownButton.vue'

const { feature, iconSets, currentLang } = defineProps<{
    feature: EditableFeature
    iconSets: Array<DrawingIconSet>
    currentLang: string
}>()

const emits = defineEmits<{
    change: [void]
    changeIconSize: [size: FeatureStyleSize]
    changeIcon: [icon: DrawingIcon]
    changeIconColor: [color: FeatureStyleColor]
}>()

const { t } = useI18n()

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

const iconSetDropdownItems = computed(() => {
    return iconSets.map((iconSet) => {
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
    const iconSetNameToLookup = feature?.icon?.iconSetName ?? 'default'
    currentIconSet.value =
        iconSets.find((iconSet) => iconSet.name === iconSetNameToLookup) ??
        iconSets.find((iconSet) => iconSet.name === 'default')
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
            v-if="feature.iconSize && currentIconSet"
            class="d-flex mb-3"
        >
            <DrawingStyleSizeSelector
                :current-size="feature.iconSize"
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
            v-if="currentIconSet && currentIconSet.isColorable && feature.fillColor"
            class="mb-3"
            inline
            :current-color="feature.fillColor"
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
                    :current-feature="feature"
                    :current-lang="currentLang"
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
