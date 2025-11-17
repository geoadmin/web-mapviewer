<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { FeatureStyleSize } from '@/utils/featureStyleUtils'

import DropdownButton, { type DropdownItem } from '@/utils/components/DropdownButton.vue'
import { allStylingSizes } from '@/utils/featureStyleUtils'

const { currentSize } = defineProps<{
    currentSize?: FeatureStyleSize
}>()

const emits = defineEmits<{
    change: [size: FeatureStyleSize]
}>()

const { t } = useI18n()

const sizeLabel = computed<string | undefined>(() => currentSize?.label)
const dropdownItems = computed<DropdownItem<FeatureStyleSize>[]>(() =>
    allStylingSizes.map((size) => {
        return { id: size.label, title: size.label, value: size }
    })
)

function onSizeSelect(dropdownItem: DropdownItem<FeatureStyleSize>): void {
    emits('change', dropdownItem.value)
}
</script>

<template>
    <div>
        <label
            class="form-label"
            for="drawing-style-text-size-selector"
        >
            {{ t('modify_text_size_label') }}
        </label>
        <DropdownButton
            v-if="sizeLabel"
            id="drawing-style-text-size-selector"
            data-cy="drawing-style-size-selector"
            :title="sizeLabel"
            :items="dropdownItems"
            :current-value="currentSize!.label"
            @select-item="onSizeSelect"
        />
    </div>
</template>
