<script setup>
import { ref, toRefs } from 'vue'

import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const props = defineProps({
    content: {
        type: HTMLDivElement,
        default: 0,
    },
})
const { content } = toRefs(props)

useTippyTooltip('#printModaleButton [data-tippy-content]')

const showModal = ref(false)

function printContent() {
    showModal.value = true
}
</script>

<template>
    <button
        id="printModalButton"
        class="btn btn-light btn-sm d-flex align-items-center"
        :data-tippy-content="'print'"
        @click.stop="printContent"
    >
        <FontAwesomeIcon icon="print" />
    </button>
    <ModalWithBackdrop v-if="showModal" :call-print="true" :title="' '" @close="showModal = false">
        <!-- eslint-disable-next-line vue/no-v-html-->
        <div v-html="content.innerHTML"></div>
    </ModalWithBackdrop>
</template>
