<script setup>
import { ref, toRefs } from 'vue'

import ModalPrintWithBackdrop from '@/utils/components/ModalPrintWithBackdrop.vue'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const props = defineProps({
    content: {
        type: HTMLDivElement,
        default: 0,
    },
})
const { content } = toRefs(props)

const emits = defineEmits(['hideParentModal'])

useTippyTooltip('#PrintButtoneButton [data-tippy-content]')

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
        id="PrintButton"
        class="btn btn-light btn-sm d-flex align-items-center"
        :data-tippy-content="'print'"
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
        <!-- eslint-disable-next-line vue/no-v-html-->
        <div v-html="content.innerHTML.replace('feature-list ', 'feature-list fluid ')"></div>
    </ModalPrintWithBackdrop>
</template>
