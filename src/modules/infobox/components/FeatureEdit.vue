<script setup>
import { toRefs } from 'vue'

import EditableFeature from '@/api/features/EditableFeature.class'
import FeatureStyleEdit from '@/modules/infobox/components/styling/FeatureStyleEdit.vue'

const props = defineProps({
    feature: {
        type: EditableFeature,
        required: true,
    },
    readOnly: {
        type: Boolean,
        default: false,
    },
})
const { feature, readOnly } = toRefs(props)
</script>

<template>
    <div class="feature-edit" data-infobox="height-reference">
        <FeatureStyleEdit :feature="feature" :read-only="readOnly" />
    </div>
</template>
