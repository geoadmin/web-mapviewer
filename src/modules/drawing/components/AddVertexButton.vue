<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'
const dispatcher = { dispatcher: 'AddVertexButton.vue' }
const store = useStore()

const props = defineProps({
    tooltipText: {
        type: String,
        default: 'Add new vertex', // TODO: use the same tooltip system
    },
})
useTippyTooltip('#addVertexButton [data-tippy-content]', { placement: 'left' })
const emit = defineEmits(['button-mounted'])

const buttonRef = ref(null)

function addVertex() {
    store.dispatch('setDrawingMode', { mode: EditableFeatureTypes.LINEPOLYGON, ...dispatcher })
}

onMounted(() => {
    // Emit an event to notify the parent component that the button is mounted
    emit('button-mounted', buttonRef.value)
})
</script>

<template>
    <div id="addVertexButton" ref="buttonRef">
        <button
            class="toolbox-button d-print-none"
            :data-tippy-content="props.tooltipText"
            @click="addVertex"
        >
            <font-awesome-icon size="sm" :icon="['fas', 'plus']" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
</style>
