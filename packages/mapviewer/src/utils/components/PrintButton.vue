<script setup>
import { ref, useTemplateRef } from 'vue'

import ModalPrintWithBackdrop from '@/utils/components/ModalPrintWithBackdrop.vue'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const { content } = defineProps({
    content: {
        type: [HTMLDivElement, null],
        default: null,
    },
})

const emits = defineEmits(['hideParentModal'])

const printButton = useTemplateRef('printButton')
useTippyTooltip(printButton, 'print')

const showModal = ref(false)

function printContent() {
    showModal.value = true
}
function onHideParentModal(hide) {
    emits('hideParentModal', hide)
}
</script>

<template>
    <button
        ref="printButton"
        class="print-button btn btn-light btn-sm d-flex align-items-center"
        data-cy="print-button"
        @click="printContent"
    >
        <FontAwesomeIcon icon="print" />
    </button>
    <ModalPrintWithBackdrop
        v-if="showModal"
        @close="showModal = false"
        @hide-parent-modal="onHideParentModal"
    >
        <!-- without the fluid class the infobox content gets cut off in the print -->
        <!-- eslint-disable vue/no-v-html -->
        <div
            v-if="content"
            class="card"
            v-html="content.innerHTML.replace('feature-list ', 'feature-list fluid ')"
        />
        <!-- eslint-enable vue/no-v-html -->
        <slot />
    </ModalPrintWithBackdrop>
</template>
