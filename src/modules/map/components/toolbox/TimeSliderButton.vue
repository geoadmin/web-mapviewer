<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import TimeSlider from '@/modules/map/components/toolbox/TimeSlider.vue'

const store = useStore()
const i18n = useI18n()

const showTimeSlider = ref(false)

const visibleLayersWithTimeConfig = computed(() => store.getters.visibleLayersWithTimeConfig)
const previewYear = computed(() => store.state.layers.previewYear)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)

watch(previewYear, () => {
    // hiding the time slider if the preview has been cleared
    if (!previewYear.value) {
        showTimeSlider.value = false
    }
})
</script>

<template>
    <button
        v-if="visibleLayersWithTimeConfig.length > 0"
        class="toolbox-button d-print-none mb-1"
        data-cy="time-slider-button"
        :class="{ active: showTimeSlider }"
        :title="showTimeSlider ? i18n.t('time_hide') : i18n.t('time_show')"
        @click="showTimeSlider = !showTimeSlider"
    >
        <font-awesome-icon size="lg" :icon="['fas', 'clock-rotate-left']" />
    </button>
    <div
        v-if="visibleLayersWithTimeConfig.length"
        class="time-sliders m-1 position-fixed"
        :class="{
            'dev-disclaimer-present': hasDevSiteWarning,
        }"
    >
        <TimeSlider v-if="showTimeSlider" />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@import 'src/modules/map/scss/toolbox-buttons';

$openCloseButtonHeight: 0rem;

.time-sliders {
    top: $header-height;
    left: 0;
    width: calc(100% - $map-button-diameter - $spacer);
    &.dev-disclaimer-present {
        top: $header-height + $dev-disclaimer-height;
    }
    &.fullscreen-mode,
    &.dev-disclaimer-present.fullscreen-mode {
        top: 0;
    }
}

@include respond-above(sm) {
    .time-sliders {
        top: $header-height + $openCloseButtonHeight;
        &.dev-disclaimer-present {
            top: $header-height + $openCloseButtonHeight + $dev-disclaimer-height;
        }
    }
}

@include respond-above(lg) {
    .time-sliders {
        left: $menu-tray-width;
        transform: none;
        width: calc(100% - $map-button-diameter - $menu-tray-width - $spacer);
    }
    .time-sliders {
        top: 2 * $header-height;
        &.dev-disclaimer-present {
            top: 2 * $header-height + $dev-disclaimer-height;
        }
    }
}
</style>
