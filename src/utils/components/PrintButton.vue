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

useTippyTooltip('#PrintButtoneButton [data-tippy-content]')

const showModal = ref(false)

function printContent() {
    showModal.value = true
    console.error(content)
}
</script>

<template>
    <button
        id="PrintButtonButton"
        class="btn btn-light btn-sm d-flex align-items-center"
        :data-tippy-content="'print'"
        @click="printContent"
    >
        <FontAwesomeIcon icon="print" />
    </button>
    <ModalPrintWithBackdrop v-if="showModal" @close="showModal = false">
        <!-- eslint-disable-next-line vue/no-v-html-->
        <div v-html="content.innerHTML"></div>
    </ModalPrintWithBackdrop>
</template>
