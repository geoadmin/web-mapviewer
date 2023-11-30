<script setup>
import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable'
import Feature from 'ol/Feature'
import { computed, defineEmits, watch } from 'vue'
import { useStore } from 'vuex'

const emits = defineEmits({
    drawEnd(payload) {
        return payload instanceof Feature
    },
})

const store = useStore()

const availableIconSets = computed(() => store.state.drawing.iconSets)

const { lastFinishedFeature } = useDrawingModeInteraction({
    editableFeatureArgs: {
        icon: availableIconSets.value.find((set) => set.name === 'default')?.icons[0],
        featureType: EditableFeatureTypes.MARKER,
    },
})

watch(lastFinishedFeature, (newFinishedFeature) => {
    emits('drawEnd', newFinishedFeature)
})

defineExpose({
    lastFinishedFeature,
})
</script>

<template>
    <slot />
</template>
