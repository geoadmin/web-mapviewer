<script setup>
import { Chart, LineController } from 'chart.js'
import { nextTick, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'

const props = defineProps({
    options: {
        type: Object,
        default: null,
    },
    data: {
        type: Object,
        required: true,
    },
})

const { options, data } = toRefs(props)

const chartContainer = ref(null)
let chartJsInstance = null

Chart.register(LineController)

let chartContainerResizeObserver
onMounted(() => {
    chartJsInstance = new Chart(chartContainer.value, {
        type: 'line',
        data: data.value,
        options: options.value ?? {},
    })
    chartContainerResizeObserver = new ResizeObserver((e) => setChartHeight(e.height))
    chartContainerResizeObserver.observe(chartContainer.value)
})

onBeforeUnmount(() => {
    chartContainerResizeObserver.unobserve(chartContainer.value)
    chartJsInstance.destroy()
})

watch(data, updateChart, { deep: true })
watch(options, updateChart, { deep: true })

/** @param {Number} newHeight Height wanted, in pixels */
function setChartHeight(newHeight) {
    const ctx = chartContainer.value
    if (ctx) {
        ctx.height = newHeight
    }
    updateChart()
}

function updateChart() {
    nextTick(() => {
        chartJsInstance?.update()
    })
}

defineExpose({
    setChartHeight,
    updateChart,
})
</script>

<template>
    <canvas ref="chartContainer" class="w-100" />
</template>
