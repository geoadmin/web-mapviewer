<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import DropdownButton, { type DropdownItem } from '@/utils/components/DropdownButton.vue'
import { allStylingSizes, FeatureStyleSize } from '@/utils/featureStyleUtils'

const { currentSize } = defineProps<{
    currentSize: FeatureStyleSize
}>()

const emits = defineEmits<{
    change: [size: FeatureStyleSize]
}>()

const { t } = useI18n()

const sizes = ref<FeatureStyleSize[]>(allStylingSizes)

const dropdownItems = computed<DropdownItem[]>(() =>
    sizes.value.map((size) => {
        return {
            id: size.label,
            title: size.label,
            value: size,
            selected: size.label === currentSize?.label,
        }
    })
)

function onSizeSelect(dropdownItem: DropdownItem): void {
    const size: FeatureStyleSize = dropdownItem.value as FeatureStyleSize
    emits('change', size)
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
            id="drawing-style-text-size-selector"
            data-cy="drawing-style-size-selector"
            :title="currentSize.label"
            :items="dropdownItems"
            :current-value="currentSize"
            @select-item="onSizeSelect"
        />
    </div>
</template>
