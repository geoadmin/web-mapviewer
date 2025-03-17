<script setup>
import log from '@geoadmin/log'
import { Toast } from 'bootstrap'
import { onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import GeoadminTooltip from '@/utils/components/GeoadminTooltip.vue'

const { parameters } = defineProps({
    parameters: {
        type: Array,
        required: true,
    },
})

const { t } = useI18n()

const tooltipContent = ref(t('copy_cta'))
const deviceOrientationToast = ref(null)
const deviceOrientationToastElement = useTemplateRef('deviceOrientationToastElement')
const isToastActive = ref(false)

onMounted(() => {
    deviceOrientationToast.value = Toast.getOrCreateInstance(deviceOrientationToastElement.value)
})

function toggleToast() {
    if (isToastActive.value) {
        deviceOrientationToast.value.hide()
        isToastActive.value = false
    } else {
        deviceOrientationToast.value.show()
        isToastActive.value = true
    }
}

async function copyValue(event, value) {
    try {
        await navigator.clipboard.writeText(value)
        tooltipContent.value = t('copy_done')

        setTimeout(() => {
            tooltipContent.value = t('copy_cta')
        }, 3000)
    } catch (error) {
        log.error(`Failed to copy ${value} to clipboard`, error)
    }
}
</script>

<template>
    <teleport to="#debug-tools-menu">
        <div class="d-flex flex-column align-items-center">
            <button
                id="DeviceOrientationToastBtn"
                type="button"
                class="toolbox-button m-auto"
                :class="{ active: isToastActive }"
                @click="toggleToast"
            >
                <FontAwesomeIcon icon="location-arrow" />
            </button>
            <label class="toolbox-button-label">Orientation</label>
        </div>
    </teleport>

    <div class="toast-container position-fixed bottom-0 end-0 p-5 clear-no-ios-long-press">
        <div
            id="DeviceOrientationToast"
            ref="deviceOrientationToastElement"
            class="toast"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            data-bs-autohide="false"
        >
            <div class="toast-header">
                <strong class="me-auto">Device Orientation</strong>
                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="toast"
                    aria-label="Close"
                    @click="isToastActive = false"
                />
            </div>
            <div class="toast-body">
                <div
                    v-for="parameter in parameters"
                    :key="parameter.title"
                >
                    <div class="text-decoration-underline fw-bold">{{ parameter.title }}:</div>
                    <div>
                        <div
                            v-for="subParam in parameter.parameters"
                            :key="subParam.key"
                            class="d-flex"
                        >
                            <div>
                                {{ subParam.key ? `${subParam.key}: ` : '' }}{{ subParam.value }}
                            </div>
                            <GeoadminTooltip :tooltip-content="tooltipContent">
                                <button
                                    v-if="subParam.hasCopyBtn"
                                    class="copy-btn btn btn-sm btn-light text-black-50"
                                    type="button"
                                    @click="copyValue($event, subParam.value)"
                                >
                                    <FontAwesomeIcon
                                        class="icon"
                                        :icon="['far', 'copy']"
                                    />
                                </button>
                            </GeoadminTooltip>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
</style>
