<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { EditMode } from '@/store/modules/drawing.store'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'
const dispatcher = { dispatcher: 'AddVertexButton.vue' }

const props = defineProps({
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

const buttonRef = ref(null)

const i18n = useI18n()
const store = useStore()

useTippyTooltip('#addVertexButton [data-tippy-content]', { placement: 'left' })

onMounted(() => {
    // Emit an event to notify the parent component that the button is mounted
    emit('button-mounted', buttonRef.value)
})

function addVertex() {
    store.dispatch('setEditingMode', {
        mode: EditMode.EXTEND,
        reverseLineStringExtension: props.reverse,
        ...dispatcher,
    })
}
</script>

<template>
    <div id="addVertexButton" ref="buttonRef">
        <button
            class="overlay-button d-print-none"
            :data-tippy-content="i18n.t(props.tooltipText)"
            @click="addVertex"
        >
            <font-awesome-icon :icon="['fas', 'plus']" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
</style>
