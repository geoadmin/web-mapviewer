<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { onMounted, useTemplateRef } from 'vue'
import { useStore } from 'vuex'

import { EditMode } from '@/store/modules/drawing.store'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const dispatcher = { dispatcher: 'AddVertexButton.vue' }

const { tooltipText, reverse } = defineProps({
    tooltipText: {
        type: String,
        default: 'modify_add_vertex',
    },
    // If true, the button will add a vertex in the reverse direction
    reverse: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['button-mounted'])

const store = useStore()

const buttonRef = useTemplateRef('buttonRef')
useTippyTooltip(buttonRef, tooltipText, { placement: 'left' })

onMounted(() => {
    // Emit an event to notify the parent component that the button is mounted
    emit('button-mounted', buttonRef.value)
})

function addVertex() {
    store.dispatch('setEditingMode', {
        mode: EditMode.EXTEND,
        reverseLineStringExtension: reverse,
        ...dispatcher,
    })
}
</script>

<template>
    <button
        ref="buttonRef"
        class="overlay-button d-print-none"
        @click="addVertex"
    >
        <font-awesome-icon :icon="['fas', 'plus']" />
    </button>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
</style>
