<script setup>
import { onBeforeUnmount, onMounted, ref, toRefs } from 'vue'

import log from '@/utils/logging'

const props = defineProps({
    duration: {
        type: Number,
        required: true,
    },
    barClass: {
        type: String,
        default: '',
    },
})
const { duration, barClass } = toRefs(props)

const value = ref(0)
const waitTime = ref(0)
const totalTime = ref(0)
const slot = ref(0)

const maxValue = 100

let started = null
let timer = null
onMounted(() => {
    started = Date.now()
    totalTime.value = duration.value * 1000
    slot.value = Math.floor((maxValue * 2) / 3)
    waitTime.value = (totalTime.value * 2) / 3 / slot.value
    log.debug(
        `progress value=${value.value} slot=${slot.value} duration=${duration.value} waitTime=${waitTime.value}`
    )
    timer = setTimeout(progress, waitTime.value)
})

onBeforeUnmount(() => {
    clearTimeout(timer)
    log.debug(`progress finished after ${Date.now() - started}ms`)
})

function progress() {
    value.value += 1
    if (value.value < maxValue) {
        if (value.value === slot.value) {
            slot.value = Math.floor((100 - slot.value) / 2 + slot.value)

            waitTime.value *= 2
            log.debug(
                `progress value=${value.value} slot=${slot.value} new waitTime=${waitTime.value}`
            )
        }
        timer = setTimeout(progress, waitTime.value)
    }
}
</script>

<template>
    <div class="progress">
        <div
            class="progress-bar"
            :class="barClass"
            role="progressbar"
            :style="`width: ${value}%`"
            :aria-valuenow="value"
            aria-valuemin="0"
            aria-valuemax="100"
        />
    </div>
</template>
