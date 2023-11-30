<script setup>
import { EditableFeature } from '@/api/features.api'
import { toRef } from 'vue'
import FeatureStyleEdit from './styling/FeatureStyleEdit.vue'

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
const { feature, readOnly } = toRef(props)
</script>

<template>
    <div class="feature-edit" data-infobox="height-reference">
        <FeatureStyleEdit :feature="feature" :read-only="readOnly" />
    </div>
</template>
