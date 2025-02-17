<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import GeoadminTooltip from '@/utils/components/GeoadminTooltip.vue'
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

const translatedMessage = computed(() => t(errorMessage.msg, errorMessage.params))
</script>

<template>
    <GeoadminTooltip
        :tooltip-content="translatedMessage"
        theme="danger"
    >
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
    </GeoadminTooltip>
</template>

<style lang="scss" scoped></style>
