<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import CoordinateCopySlot from '@/utils/components/CoordinateCopySlot.vue'
import allFormats from '@/utils/coordinates/coordinateFormat'

const { t } = useI18n()

const store = useStore()
const pinnedLocation = computed(() => store.state.map.pinnedLocation)

const coordinateFormat = computed(() => {
    return allFormats.find((format) => format.id === store.state.position.displayedFormatId) ?? null
})
</script>

<template>
    <div class="border-start">
        <div
            class="p-2 sticky-top bg-secondary-subtle border-bottom border-secondary-subtle d-flex align-items-center cursor-pointer"
        >
            <strong class="flex-grow-1">{{ t('query_search') }}</strong>
        </div>
        <div class="d-flex pb-2 px-2 gap-1 justify-content-start align-items-center">
            <CoordinateCopySlot
                identifier="pinned-coordinate-copy"
                :value="pinnedLocation"
                :coordinate-format="coordinateFormat"
            >
                <FontAwesomeIcon class="small align-text-top" icon="fas fa-map-marker-alt" />
            </CoordinateCopySlot>
        </div>
    </div>
</template>
