<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import GeoadminTooltip from '@/utils/components/GeoadminTooltip.vue'
import { normalizeExtent } from '@/utils/extentUtils'

const { t } = useI18n()

const dispatcher = { dispatcher: 'ZoomToExtentButton.vue' }

const { extent } = defineProps({
    extent: {
        type: Array,
        required: true,
        validator: (value) => Array.isArray(value) && !!normalizeExtent(value),
    },
})

const store = useStore()

function zoomToFeatureExtent() {
    store.dispatch('zoomToExtent', {
        extent: normalizeExtent(extent),
        ...dispatcher,
    })
}
</script>

<template>
    <GeoadminTooltip :tooltip-content="t('offline_zoom_extent')">
        <button
            ref="zoomToExtentButton"
            class="zoom-to-extent-button btn btn-xs"
            data-cy="zoom-to-feature-extent"
            @click="zoomToFeatureExtent"
        >
            <FontAwesomeIcon icon="fa-search-plus" />
        </button>
    </GeoadminTooltip>
</template>
