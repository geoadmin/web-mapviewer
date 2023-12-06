<template>
    <div>
        <label class="form-label" for="drawing-style-text-size-selector">
            {{ $t('modify_text_size_label') }}
        </label>
        <DropdownButton
            id="drawing-style-text-size-selector"
            data-cy="drawing-style-size-selector"
            :current-value="currentSize"
            :title="$t(sizeLabel)"
            :items="dropdownItems"
            @select:item="onSizeSelect"
        />
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n'

import DropdownButton, { DropdownItem } from '@/utils/DropdownButton.vue'
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
    setup() {
        const i18n = useI18n()
        return {
            i18n,
        }
    },
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
        dropdownItems() {
            return this.sizes.map((size) => {
                return new DropdownItem(this.i18n.t(size.label), size)
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
