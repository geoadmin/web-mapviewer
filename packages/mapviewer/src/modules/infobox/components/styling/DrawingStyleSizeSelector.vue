<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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
            :current-value="currentSize"
            :title="sizeLabel"
            :items="dropdownItems"
            @select-item="onSizeSelect"
        />
    </div>
</template>

<script>
import DropdownButton from '@/utils/components/DropdownButton.vue'
import { allStylingSizes, FeatureStyleSize } from '@/utils/featureStyleUtils'

export default {
    components: { DropdownButton },
    props: {
        currentSize: {
            type: FeatureStyleSize,
            required: true,
        },
    },
    emits: ['change'],
    data() {
        return {
            sizes: allStylingSizes,
        }
    },
    computed: {
        sizeLabel() {
            if (!this.currentSize) {
                return null
            }
            return this.currentSize.label
        },
        /** @returns {DropdownItem[]} */
        dropdownItems() {
            return this.sizes.map((size) => {
                return { id: size.label, title: size.label, value: size }
            })
        },
    },
    methods: {
        onSizeSelect(dropdownItem) {
            this.$emit('change', dropdownItem.value)
        },
    },
}
</script>
