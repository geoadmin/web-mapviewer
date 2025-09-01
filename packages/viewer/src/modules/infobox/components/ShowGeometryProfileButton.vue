<script setup lang="js">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import LayerFeature from '@/api/features/LayerFeature.class'
import SelectableFeature from '@/api/features/SelectableFeature.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'

const dispatcher = { dispatcher: 'ShowGeometryProfileButton.vue' }

const { feature } = defineProps({
    feature: {
        type: SelectableFeature,
        required: true,
    },
})

const { t } = useI18n()
const store = useStore()

function showProfile() {
    let simplifyGeometry = false
    if (feature instanceof LayerFeature) {
        // PB-800 : to avoid a coastline paradox we simplify the geometry of GPXs
        // as they might be coming directly from a GPS device (meaning polluted with GPS uncertainty/error)
        simplifyGeometry = feature.layer.type === LayerTypes.GPX
    }
    store.dispatch('setProfileFeature', {
        feature,
        simplifyGeometry,
        ...dispatcher,
    })
}
</script>

<template>
    <button
        class="btn btn-xs btn-outline-secondary no-print"
        data-cy="show-profile"
        @click="showProfile"
    >
        <FontAwesomeIcon
            icon="fa-chart-area"
            class="me-1"
        />
        <span>{{ t('display_profile') }}</span>
    </button>
</template>
