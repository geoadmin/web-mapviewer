<script setup>
import { Toast } from 'bootstrap'
import { onMounted, ref, toRefs } from 'vue'

const props = defineProps({
    parameters: {
        type: Array,
        required: true,
    },
})
const { parameters } = toRefs(props)

const deviceOrientationToast = ref(null)
const deviceOrientationToastElement = ref(null)
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

    <div class="toast-container position-fixed bottom-0 end-0 p-3 clear-no-ios-long-press">
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
                ></button>
            </div>
            <div class="toast-body">
                <div v-for="parameter in parameters" :key="parameter.title">
                    <div class="text-decoration-underline fw-bold">{{ parameter.title }}:</div>
                    <div>
                        <div v-for="subParam in parameter.parameters" :key="subParam.key">
                            {{ subParam.key ? `${subParam.key}: ` : '' }}{{ subParam.value }}
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
