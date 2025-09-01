<script setup lang="js">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import EditableFeature from '@/api/features/EditableFeature.class'
import DrawingStyleColorSelector from '@/modules/infobox/components/styling/DrawingStyleColorSelector.vue'
import DrawingStyleIcon from '@/modules/infobox/components/styling/DrawingStyleIcon.vue'
import DrawingStyleSizeSelector from '@/modules/infobox/components/styling/DrawingStyleSizeSelector.vue'
import DropdownButton from '@/utils/components/DropdownButton.vue'

const { feature, iconSets } = defineProps({
    feature: {
        type: EditableFeature,
        required: true,
    },
    iconSets: {
        type: Array,
        required: true,
    },
})

const emits = defineEmits(['change', 'change:iconSize', 'change:icon', 'change:iconColor'])

const { t } = useI18n()

const showAllSymbols = ref(false)
const currentIconSet = ref(null)
const loadedImages = ref(0)

const currentIconSetName = computed(() => {
    if (currentIconSet.value) {
        return t(`modify_icon_category_${currentIconSet.value.name}_label`, 1, {
            locale: currentIconSet.value.language,
        })
    }
    return ''
})
/** @returns {DropdownItem[]} */
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

function onCurrentIconColorChange(color) {
    emits('change:iconColor', color)
    emits('change')
}

function onCurrentIconSizeChange(size) {
    emits('change:iconSize', size)
    emits('change')
}

function changeDisplayedIconSet(dropdownItem) {
    currentIconSet.value = dropdownItem.value
}

function onImageLoad() {
    loadedImages.value = loadedImages.value + 1
    if (loadedImages.value === currentIconSet.value.icons.length) {
        loadedImages.value = 0
    }
}

function onCurrentIconChange(icon) {
    showAllSymbols.value = true
    emits('change:icon', icon)
    emits('change')
}
</script>

<template>
    <div class="d-block">
        <div class="d-flex mb-3">
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
            v-if="currentIconSet && currentIconSet.isColorable"
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
                    @change:icon="onCurrentIconChange"
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
