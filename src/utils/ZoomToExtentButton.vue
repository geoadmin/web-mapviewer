<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toRefs } from 'vue'
import { useStore } from 'vuex'

import { normalizeExtent } from '@/utils/coordinates/coordinateUtils'
import { useTippyTooltip } from '@/utils/useTippyTooltip'

const dispatcher = { dispatcher: 'ZoomToExtentButton.vue' }

const props = defineProps({
    extent: {
        type: Array,
        required: true,
        validator: (value) => Array.isArray(value) && !!normalizeExtent(value),
    },
})

const { extent } = toRefs(props)

useTippyTooltip('.zoom-to-extent-button', { placement: 'top' })

const store = useStore()

function zoomToFeatureExtent() {
    store.dispatch('zoomToExtent', {
        extent: normalizeExtent(extent.value),
        ...dispatcher,
    })
}
</script>

<template>
    <button
        class="zoom-to-extent-button btn btn-xs text-secondary"
        data-tippy-content="offline_zoom_extent"
        data-cy="zoom-to-feature-extent"
        @click="zoomToFeatureExtent"
    >
        <FontAwesomeIcon icon="fa-search-plus" />
    </button>
</template>
