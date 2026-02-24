<script setup lang="ts">
import type { CoordinateSystem, FlatExtent, NormalizedExtent } from '@swissgeo/coordinates'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { extentUtils } from '@swissgeo/coordinates'
import GeoadminTooltip from '@swissgeo/tooltip'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import usePositionStore from '@/store/modules/position'

const { t } = useI18n()

const dispatcher: ActionDispatcher = { name: 'ZoomToExtentButton.vue' }

const { extent, extentProjection } = defineProps<{
    extent: FlatExtent | NormalizedExtent
    extentProjection: CoordinateSystem
}>()

const positionStore = usePositionStore()

function zoomToFeatureExtent() {
    positionStore.zoomToExtent(
        extentUtils.normalizeExtent(extent),
        {
            extentProjection: extentProjection,
        },
        dispatcher
    )
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
