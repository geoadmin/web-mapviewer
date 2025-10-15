<script setup lang="ts">
import log from '@swissgeo/log'
import GeoadminTooltip from '@swissgeo/tooltip'
import { Toast } from 'bootstrap'
import { onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

interface Parameter {
    title?: string
    parameters: Array<{
        key?: string
        value: string
        hasCopyBtn?: boolean
    }>
}

const { parameters } = defineProps<{
    parameters: Parameter[]
}>()

const { t } = useI18n()

const tooltipContent = ref(t('copy_cta'))
const deviceOrientationToast = ref<Toast | undefined>(undefined)
const deviceOrientationToastElement = useTemplateRef<HTMLElement>('deviceOrientationToastElement')
const isToastActive = ref(false)

onMounted(() => {
    if (deviceOrientationToastElement.value) {
        deviceOrientationToast.value = Toast.getOrCreateInstance(
            deviceOrientationToastElement.value
        )
    }
})

function toggleToast(): void {
    if (!deviceOrientationToast.value) return

    if (isToastActive.value) {
        deviceOrientationToast.value.hide()
        isToastActive.value = false
    } else {
        deviceOrientationToast.value.show()
        isToastActive.value = true
    }
}

async function copyValue(_event: Event, value: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(value)
        tooltipContent.value = t('copy_done')

        setTimeout(() => {
            tooltipContent.value = t('copy_cta')
        }, 3000)
    } catch (error) {
        log.error({
            title: 'OpenLayersDeviceOrientationDebugInfo.vue',
            messages: [`Failed to copy ${value} to clipboard`, error],
        })
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

    <div class="toast-container position-fixed clear-no-ios-long-press end-0 bottom-0 p-5">
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
