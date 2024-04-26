<script setup>
import { computed, nextTick, watch } from 'vue'
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/useTippyTooltip'

const dispatcher = { dispatcher: 'TimeSliderButton.vue' }

const store = useStore()

const { refreshTippyAttachment } = useTippyTooltip('#timeSlider [data-tippy-content]', {
    placement: 'left',
})

const visibleLayersWithTimeConfig = computed(() => store.getters.visibleLayersWithTimeConfig)
const isTimeSliderActive = computed(() => store.state.ui.isTimeSliderActive)

watch(visibleLayersWithTimeConfig, () =>
    nextTick(() => {
        refreshTippyAttachment()
        if (isTimeSliderActive.value && visibleLayersWithTimeConfig.value.length === 0) {
            store.dispatch('setTimeSliderActive', {
                active: false,
                ...dispatcher,
            })
        }
    })
)

function toggleTimeSlider() {
    store.dispatch('setTimeSliderActive', {
        active: !isTimeSliderActive.value,
        ...dispatcher,
    })
}
</script>

<template>
    <button
        v-if="visibleLayersWithTimeConfig.length > 0"
        class="toolbox-button d-print-none mb-1"
        data-cy="time-slider-button"
        :class="{ active: isTimeSliderActive }"
        :data-tippy-content="isTimeSliderActive ? 'time_hide' : 'time_show'"
        @click="toggleTimeSlider"
    >
        <font-awesome-icon size="lg" :icon="['fas', 'clock-rotate-left']" />
    </button>
</template>

<style lang="scss" scoped>
@import 'src/modules/map/scss/toolbox-buttons';
</style>
