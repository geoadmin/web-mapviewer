<script setup lang="ts">
import { type Layer, getFirstErrorMessage, getFirstWarningMessage } from '@geoadmin/layers'
import { ErrorMessage, WarningMessage } from '@geoadmin/log/Message'
import GeoadminTooltip from '@geoadmin/tooltip'
import { computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

const { showSpinner, layer, index } = defineProps<{
    showSpinner: boolean
    layer: Layer
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

const theme = computed(() => {
    if (hasError.value) {
        return 'danger'
    }
    if (hasWarning.value) {
        return 'warning'
    }
    return 'light'
})
const tooltipContent = computed((): string => {
    if (hasError.value) {
        // save to assume that there *is* an error thanks to the guard
        const error: ErrorMessage | null = getFirstErrorMessage(layer)
        if (error) {
            return t(error.msg, error.params)
        } else {
            return ''
        }
    }
    if (hasWarning.value) {
        const warning: WarningMessage | null = getFirstWarningMessage(layer)
        if (warning) {
            return t(warning.msg, warning.params)
        } else {
            return ''
        }
    }

    return t('loading_external_layer')
})
</script>

<template>
    <GeoadminTooltip
        ref="tooltip"
        :tooltip-content="tooltipContent"
        :theme="theme"
    >
        <button
            v-if="showSpinner"
            ref="loadingSpinner"
            class="loading-button btn d-flex align-items-center btn-lg border-0"
            :data-cy="`button-loading-metadata-spinner-${layer.id}-${index}`"
        >
            <FontAwesomeIcon
                icon="spinner"
                pulse
            />
        </button>
        <button
            v-else-if="hasError"
            class="btn text-danger d-flex align-items-center btn-lg border-0 p-0"
            aria-disabled="true"
            tabindex="-1"
            :data-cy="`button-has-error-${layer.id}`"
        >
            <FontAwesomeIcon icon="circle-exclamation" />
        </button>

        <button
            v-else-if="hasWarning"
            class="btn text-warning d-flex align-items-center btn-lg border-0 p-0"
            aria-disabled="true"
            tabindex="-1"
            :data-cy="`button-has-warning-${layer.id}`"
        >
            <FontAwesomeIcon icon="triangle-exclamation" />
        </button>
    </GeoadminTooltip>
</template>
