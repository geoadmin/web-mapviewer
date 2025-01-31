<script setup>
import Feature from 'ol/Feature'
import { computed } from 'vue'
import { useStore } from 'vuex'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { DEFAULT_MARKER_TITLE_OFFSET } from '@/api/icon.api'
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
        textOffset: DEFAULT_MARKER_TITLE_OFFSET,
    },
    drawEndCallback: (feature) => {
        emits('drawEnd', feature)
    },
})
</script>

<template>
    <slot />
</template>
