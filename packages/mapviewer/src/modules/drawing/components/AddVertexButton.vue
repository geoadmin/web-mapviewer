<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { onMounted, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { EditMode } from '@/store/modules/drawing.store'
import GeoadminTooltip from '@/utils/components/GeoadminTooltip.vue'

const { t } = useI18n()

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

const elementRef = useTemplateRef('elementRef')

onMounted(() => {
    // Emit an event to notify the parent component that the button is mounted
    emit('button-mounted', elementRef.value.tooltipElement)
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
    <GeoadminTooltip
        ref="elementRef"
        :tooltip-content="t(tooltipText)"
        placement="left"
    >
        <button
            class="overlay-button d-print-none"
            @click="addVertex"
        >
            <font-awesome-icon :icon="['fas', 'plus']" />
        </button>
    </GeoadminTooltip>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
</style>
