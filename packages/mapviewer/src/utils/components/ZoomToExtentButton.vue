<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { CoordinateSystem } from '@geoadmin/coordinates'
import GeoadminTooltip from '@geoadmin/tooltip'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { normalizeExtent } from '@/utils/extentUtils'

const { t } = useI18n()

const dispatcher = { dispatcher: 'ZoomToExtentButton.vue' }

const { extent, extentProjection } = defineProps({
    extent: {
        type: Array,
        required: true,
        validator: (value) => Array.isArray(value) && !!normalizeExtent(value),
    },
    extentProjection: {
        type: CoordinateSystem,
        default: () => CoordinateSystem.WGS84CoordinateSystem,
        required: false,
    },
})

const store = useStore()

function zoomToFeatureExtent() {
    store.dispatch('zoomToExtent', {
        extent: normalizeExtent(extent),
        extentProjection: extentProjection,
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
