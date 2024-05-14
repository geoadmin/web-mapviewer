<script>
/**
 * As we use a Tippy tooltip for this button, if we do not use a unique selector all the button
 * rendered in a feature list will be applied, and re-applied (as many time as there are zoom to
 * extent button) leading to a huge stacking of tippy tooltip at each button.
 *
 * Using here a button counter to give each a unique ID (and have a unique Tippy selector)
 *
 * @type {number}
 */
let zoomToExtentButtonCount = 0
</script>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref, toRefs } from 'vue'
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'
import { normalizeExtent } from '@/utils/coordinates/coordinateUtils'

const dispatcher = { dispatcher: 'ZoomToExtentButton.vue' }

const props = defineProps({
    extent: {
        type: Array,
        required: true,
        validator: (value) => Array.isArray(value) && !!normalizeExtent(value),
    },
})

const { extent } = toRefs(props)

const uniqueId = ref(`zoom-to-extent-button-${++zoomToExtentButtonCount}`)

useTippyTooltip(`#${uniqueId.value}[data-tippy-content]`, { placement: 'top' })

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
        :id="uniqueId"
        class="zoom-to-extent-button btn btn-xs text-secondary"
        data-tippy-content="offline_zoom_extent"
        data-cy="zoom-to-feature-extent"
        @click="zoomToFeatureExtent"
    >
        <FontAwesomeIcon icon="fa-search-plus" />
    </button>
</template>
