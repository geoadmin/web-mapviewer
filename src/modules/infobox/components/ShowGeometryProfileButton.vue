<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import LayerFeature from '@/api/features/LayerFeature.class'
import SelectableFeature from '@/api/features/SelectableFeature.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'

const dispatcher = { dispatcher: 'ShowGeometryProfileButton.vue' }

const props = defineProps({
    feature: {
        type: SelectableFeature,
        required: true,
    },
})
const { feature } = toRefs(props)

const i18n = useI18n()
const store = useStore()

function showProfile() {
    let simplifyGeometry = false
    if (feature.value instanceof LayerFeature) {
        // PB-800 : to avoid a coastline paradox we simplify the geometry of GPXs
        // as they might be coming directly from a GPS device (meaning polluted with GPS uncertainty/error)
        simplifyGeometry = feature.value.layer.type === LayerTypes.GPX
    }
    store.dispatch('setProfileFeature', {
        feature: feature.value,
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
        <FontAwesomeIcon icon="fa-chart-area" class="me-1" />
        <span>{{ i18n.t('display_profile') }}</span>
    </button>
</template>
