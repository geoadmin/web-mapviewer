<script setup>
import { computed, nextTick, watch } from 'vue'
import { useStore } from 'vuex'

import TimeSlider from '@/modules/map/components/toolbox/TimeSlider.vue'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const dispatcher = { dispatcher: 'TimeSliderButton.vue' }

const store = useStore()

const { refreshTippyAttachment } = useTippyTooltip('#timeSlider [data-tippy-content]', {
    placement: 'left',
})

const visibleLayersWithTimeConfig = computed(() => store.getters.visibleLayersWithTimeConfig)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
const isTimeSliderActive = computed(() => store.state.ui.isTimeSliderActive)

watch(visibleLayersWithTimeConfig, () =>
    nextTick(() => {
        refreshTippyAttachment()
        if (isTimeSliderActive.value && visibleLayersWithTimeConfig.value.length === 0) {
            store.dispatch('setTimeSliderActive', {
                timeSliderActive: false,
                ...dispatcher,
            })
        }
    })
)

function toggleTimeSlider() {
    store.dispatch('setTimeSliderActive', {
        timeSliderActive: !isTimeSliderActive.value,
        ...dispatcher,
    })
}
</script>

<template>
    <div v-if="visibleLayersWithTimeConfig.length > 0" id="timeSlider">
        <button
            id="timeSliderButton"
            class="toolbox-button d-print-none mb-1"
            data-cy="time-slider-button"
            :class="{ active: isTimeSliderActive }"
            :data-tippy-content="isTimeSliderActive ? 'time_hide' : 'time_show'"
            @click="toggleTimeSlider()"
        >
            <font-awesome-icon size="lg" :icon="['fas', 'clock-rotate-left']" />
        </button>
        <div
            class="time-sliders m-1 position-fixed"
            :class="{
                'dev-disclaimer-present': hasDevSiteWarning,
            }"
        >
            <div class="d-flex justify-content-center">
                <TimeSlider v-if="isTimeSliderActive" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
@import '@/modules/map/scss/toolbox-buttons';

$openCloseButtonHeight: 0rem;

.time-sliders {
    top: $header-height;
    left: 0;
    width: calc(100% - $map-button-diameter - $spacer);
    &.dev-disclaimer-present {
        top: calc($header-height + $dev-disclaimer-height);
    }
    &.fullscreen-mode,
    &.dev-disclaimer-present.fullscreen-mode {
        top: 0;
    }
}

@include respond-above(sm) {
    .time-sliders {
        // menu appears, we move the slider to the right and take the menu
        // width into the width calculation
        left: $menu-tray-width;
        width: calc(100% - $map-button-diameter - $menu-tray-width - $spacer);
        top: calc($header-height + $openCloseButtonHeight);
        &.dev-disclaimer-present {
            top: calc($header-height + $openCloseButtonHeight + $dev-disclaimer-height);
        }
    }
}

@include respond-above(lg) {
    .time-sliders {
        transform: none;
        top: 2 * $header-height;
        &.dev-disclaimer-present {
            top: calc(2 * $header-height + $dev-disclaimer-height);
        }
    }
}
</style>
