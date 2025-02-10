<script setup>
import { computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'
import ErrorMessage from '@/utils/ErrorMessage.class'

const { compact, errorMessage } = defineProps({
    compact: {
        type: Boolean,
        required: true,
    },
    errorMessage: {
        type: ErrorMessage,
        required: true,
    },
})

const { t } = useI18n()

const errorButton = useTemplateRef('errorButton')
const translatedMessage = computed(() => t(errorMessage.msg, errorMessage.params))

useTippyTooltip(errorButton, translatedMessage, {
    theme: 'danger',
    placement: 'top',
    hideOnClick: false,
})
</script>

<template>
    <div ref="errorButton">
        <button
            class="btn text-danger border-0 p-0 d-flex align-items-center"
            :class="{
                'btn-lg': !compact,
            }"
            disabled
            aria-disabled="true"
            tabindex="-1"
            :data-cy="`button-has-error`"
        >
            <FontAwesomeIcon icon="circle-exclamation" />
        </button>
    </div>
</template>

<style lang="scss" scoped></style>
