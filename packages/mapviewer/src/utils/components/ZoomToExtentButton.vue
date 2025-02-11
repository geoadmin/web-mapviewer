<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useTemplateRef } from 'vue'
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'
import { normalizeExtent } from '@/utils/extentUtils'

const dispatcher = { dispatcher: 'ZoomToExtentButton.vue' }

const { extent } = defineProps({
    extent: {
        type: Array,
        required: true,
        validator: (value) => Array.isArray(value) && !!normalizeExtent(value),
    },
})

const zoomToExtentButton = useTemplateRef('zoomToExtentButton')
useTippyTooltip(zoomToExtentButton, 'offline_zoom_extent', { placement: 'top' })

const store = useStore()

function zoomToFeatureExtent() {
    store.dispatch('zoomToExtent', {
        extent: normalizeExtent(extent),
        ...dispatcher,
    })
}
</script>

<template>
    <button
        ref="zoomToExtentButton"
        class="zoom-to-extent-button btn btn-xs"
        data-cy="zoom-to-feature-extent"
        @click="zoomToFeatureExtent"
    >
        <FontAwesomeIcon icon="fa-search-plus" />
    </button>
</template>
