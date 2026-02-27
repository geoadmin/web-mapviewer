<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GeoadminTooltip from '@swissgeo/tooltip'
import { onMounted, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import useDrawingStore from '@/store/modules/drawing'
import { EditMode } from '@/store/modules/drawing/types'

const { t } = useI18n()

const dispatcher: ActionDispatcher = { name: 'AddVertexButton.vue' }

const { tooltipText = 'modify_add_vertex', reverse } = defineProps<{
    tooltipText?: string
    reverse?: boolean
}>()

const emit = defineEmits<{ 'button-mounted': [el: HTMLElement] }>()

const drawingStore = useDrawingStore()

const elementRef = useTemplateRef('elementRef')

onMounted(() => {
    // Emit an event to notify the parent component that the button is mounted
    if (elementRef.value?.tooltipElement) {
        emit('button-mounted', elementRef.value.tooltipElement)
    }
})

function addVertex() {
    drawingStore.setEditingMode(EditMode.Extend, !!reverse, dispatcher)
}
</script>

<template>
    <GeoadminTooltip
        ref="elementRef"
        :tooltip-content="t(tooltipText ?? 'modify_add_vertex')"
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
