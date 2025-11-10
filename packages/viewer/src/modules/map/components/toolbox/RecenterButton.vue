<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import useGeolocationStore from '@/store/modules/geolocation'

const dispatcher: ActionDispatcher = { name: 'RecenterButton.vue' }

const geolocationStore = useGeolocationStore()
const { t } = useI18n()

const showRecenterButton = computed(() => geolocationStore.active && !geolocationStore.tracking)

function recenterMap(): void {
    geolocationStore.setGeolocationTracking(true, dispatcher)
}
</script>

<template>
    <button
        v-if="showRecenterButton"
        class="toolbox-button d-print-none"
        data-cy="recenter-button"
        type="button"
        :title="t('re_center_map')"
        @click="recenterMap"
    >
        <FontAwesomeIcon
            icon="location-crosshairs"
            transform="shrink-2"
        />
    </button>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
</style>
