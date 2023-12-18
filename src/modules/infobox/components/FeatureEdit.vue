<script setup>
import { EditableFeature } from '@/api/features.api'
import FeatureStyleEdit from '@/modules/infobox/components/styling/FeatureStyleEdit.vue'

const { feature, readOnly } = defineProps({
    feature: {
        type: EditableFeature,
        required: true,
    },
    readOnly: {
        type: Boolean,
        default: false,
    },
})
</script>

<template>
    <div class="feature-edit" data-infobox="height-reference">
        <FeatureStyleEdit :feature="feature" :read-only="readOnly" />
    </div>
</template>
