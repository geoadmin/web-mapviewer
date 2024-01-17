<script setup>
import Feature from 'ol/Feature'
import { computed } from 'vue'
import { useStore } from 'vuex'

import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable'

const emits = defineEmits({
    drawEnd(payload) {
        return payload instanceof Feature
    },
})

const store = useStore()

const availableIconSets = computed(() => store.state.drawing.iconSets)

useDrawingModeInteraction({
    editableFeatureArgs: {
        icon: availableIconSets.value.find((set) => set.name === 'default')?.icons[0],
        featureType: EditableFeatureTypes.MARKER,
    },
    drawEndCallback: (feature) => {
        emits('drawEnd', feature)
    },
})
</script>

<template>
    <slot />
</template>
