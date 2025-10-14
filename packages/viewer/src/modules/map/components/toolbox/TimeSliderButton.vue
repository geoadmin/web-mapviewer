<script setup lang="ts">
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import TimeSlider from '@/modules/map/components/toolbox/TimeSlider.vue'
import useUIStore from '@/store/modules/ui.store'
import useLayersStore from '@/store/modules/layers.store'
import log, { LogPreDefinedColor } from '@swissgeo/log'

const dispatcher = { name: 'TimeSliderButton.vue' }

const { t } = useI18n()
const uiStore = useUIStore()
const layersStore = useLayersStore()

const visibleLayersWithTimeConfig = computed(() => layersStore.visibleLayersWithTimeConfig)
const isTimeSliderActive = computed(() => uiStore.isTimeSliderActive)

const tooltipContent = computed(() => t(isTimeSliderActive.value ? 'time_hide' : 'time_show'))

watch(visibleLayersWithTimeConfig, () => {
    nextTick(() => {
        if (isTimeSliderActive.value && visibleLayersWithTimeConfig.value.length === 0) {
            uiStore.setTimeSliderActive(false, dispatcher)
        }
    }).catch((error) => {
        log.error({
            title: 'TimeSliderButton.vue',
            titleColor: LogPreDefinedColor.Red,
            message: ['Error in TimeSliderButton.vue watcher:', error],
        })
    })
})

function toggleTimeSlider(): void {
    if (isTimeSliderActive.value) {
        // Reset the preview year to undefined when closing the time slider.
        layersStore.setPreviewYear(undefined)
    }
    uiStore.setTimeSliderActive(!isTimeSliderActive.value, dispatcher)
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
            class="time-sliders position-fixed m-1"
            :class="{
                'dev-disclaimer-present': uiStore.hasDevSiteWarning,
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
