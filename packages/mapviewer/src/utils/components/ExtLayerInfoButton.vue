<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import type AbstractLayer from '@/api/layers/AbstractLayer.class.js'

import GeoadminTooltip from '@/utils/components/GeoadminTooltip.vue'
import ErrorMessage from '@/utils/ErrorMessage.class'

const { showSpinner, layer, index } = defineProps<{
    showSpinner: boolean
    layer: AbstractLayer
    index: Number
}>()

const tooltip = useTemplateRef('tooltip')
const { t } = useI18n()

const hasError = computed((): boolean => {
    return !!layer.hasError
})
const hasWarning = computed((): boolean => {
    return !!layer.hasWarning
})

const tooltipContent = computed((): string => {
    if (hasError.value) {
        const error: ErrorMessage = layer.getFirstErrorMessage()
        return t(error.msg, error.params)
    }
    if (hasWarning.value) {
        const warning: WarningMessage = layer.getFirstWarningMessage()
        return t(warning.msg, warning.params)
    }

    return t('loading_external_layer')
})
</script>

<template>
    <GeoadminTooltip
        ref="tooltip"
        :tooltip-content="tooltipContent"
        :theme="hasError ? 'danger' : hasWarning ? 'warning' : 'light'"
    >
        <button
            v-if="showSpinner"
            ref="loadingSpinner"
            class="loading-button btn border-0 d-flex align-items-center btn-lg"
            :data-cy="`button-loading-metadata-spinner-${layer.id}-${index}`"
        >
            <FontAwesomeIcon
                icon="spinner"
                pulse
            />
        </button>
        <button
            v-else-if="hasError"
            class="btn text-danger border-0 p-0 d-flex align-items-center btn-lg"
            aria-disabled="true"
            tabindex="-1"
            :data-cy="`button-has-error-${layer.id}-`"
        >
            <FontAwesomeIcon icon="circle-exclamation" />
        </button>

        <button
            v-else-if="hasWarning"
            class="btn text-warning border-0 p-0 d-flex align-items-center btn-lg"
            aria-disabled="true"
            tabindex="-1"
            :data-cy="`button-has-warning-${layer.id}-`"
        >
            <FontAwesomeIcon icon="triangle-exclamation" />
        </button>
    </GeoadminTooltip>
</template>

<style lang="scss" scoped></style>
