<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import DropdownButton from '@/utils/components/DropdownButton.vue'
import DropdownButtonItem from '@/utils/components/DropdownButtonItem.vue'
import { allStylingSizes, FeatureStyleSize } from '@/utils/featureStyleUtils'

const { currentSize } = defineProps({
    currentSize: {
        type: FeatureStyleSize,
        required: true,
    },
})

const emits = defineEmits(['change'])

const { t } = useI18n()

const sizes = ref(allStylingSizes)

const sizeLabel = computed(() => currentSize?.label)
const dropdownItems = computed(() =>
    sizes.value.map((size) => {
        return { id: size.label, title: size.label, value: size }
    })
)

function onSizeSelect(dropdownItem) {
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
            id="drawing-style-text-size-selector"
            data-cy="drawing-style-size-selector"
            :title="sizeLabel"
        >
            <DropdownButtonItem
                v-for="item in dropdownItems"
                :key="item.id"
                v-bind="item"
                :current-value="currentSize"
                @select-item="onSizeSelect"
            />
        </DropdownButton>
    </div>
</template>
