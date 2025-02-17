<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import GeoadminTooltip from '@/utils/components/GeoadminTooltip.vue'
import ModalPrintWithBackdrop from '@/utils/components/ModalPrintWithBackdrop.vue'

const { content } = defineProps({
    content: {
        type: [HTMLDivElement, null],
        default: null,
    },
})

const emits = defineEmits(['hideParentModal'])
const { t } = useI18n()

const showModal = ref(false)

function printContent() {
    showModal.value = true
}
function onHideParentModal(hide) {
    emits('hideParentModal', hide)
}
</script>

<template>
    <GeoadminTooltip :tooltip-content="t('print')">
        <button
            ref="printButton"
            class="print-button btn btn-light btn-sm d-flex align-items-center"
            data-cy="print-button"
            @click="printContent"
        >
            <FontAwesomeIcon icon="print" />
        </button>
    </GeoadminTooltip>
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
