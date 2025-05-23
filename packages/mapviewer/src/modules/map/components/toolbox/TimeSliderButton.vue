<script setup>
import GeoadminTooltip from '@geoadmin/tooltip'
import { computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import TimeSlider from '@/modules/map/components/toolbox/TimeSlider.vue'

const dispatcher = { dispatcher: 'TimeSliderButton.vue' }

const store = useStore()
const { t } = useI18n()

const visibleLayersWithTimeConfig = computed(() => store.getters.visibleLayersWithTimeConfig)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
const isTimeSliderActive = computed(() => store.state.ui.isTimeSliderActive)

const tooltipContent = computed(() => t(isTimeSliderActive.value ? 'time_hide' : 'time_show'))

watch(visibleLayersWithTimeConfig, () =>
    nextTick(() => {
        if (isTimeSliderActive.value && visibleLayersWithTimeConfig.value.length === 0) {
            store.dispatch('setTimeSliderActive', {
                timeSliderActive: false,
                ...dispatcher,
            })
        }
    })
)

function toggleTimeSlider() {
    if (isTimeSliderActive.value) {
        // when closing the timeslider we reset the preview year to null so that next time
        // we reopen it we use the correct year from the layer current configurations and not reuse
        // the last preview.
        store.dispatch('setPreviewYear', { year: null, ...dispatcher })
    }
    store.dispatch('setTimeSliderActive', {
        timeSliderActive: !isTimeSliderActive.value,
        ...dispatcher,
    })
}
</script>

<template>
    <div
        v-if="visibleLayersWithTimeConfig.length > 0"
        id="timeSlider"
    >
        <GeoadminTooltip
            placement="left"
            :tooltip-content="tooltipContent"
        >
            <button
                class="toolbox-button d-print-none mb-1"
                data-cy="time-slider-button"
                :class="{ active: isTimeSliderActive }"
                @click="toggleTimeSlider()"
            >
                <font-awesome-icon
                    size="lg"
                    :icon="['fas', 'clock-rotate-left']"
                />
            </button>
        </GeoadminTooltip>
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
