<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useI18n } from 'vue-i18n'

import type { LayerFeature, SelectableFeature } from '@/api/features/types'
import type { ActionDispatcher } from '@/store/types'

import useProfileStore from '@/store/modules/profile'

const dispatcher: ActionDispatcher = { name: 'ShowGeometryProfileButton.vue' }

const { feature } = defineProps<{
    feature: SelectableFeature
}>()

const { t } = useI18n()
const profileStore = useProfileStore()

function showProfile() {
    let simplifyGeometry = false
    if (!feature.isEditable) {
        // PB-800 : to avoid a coastline paradox we simplify the geometry of GPXs
        // as they might be coming directly from a GPS device (meaning polluted with GPS uncertainty/error)
        simplifyGeometry = (feature as LayerFeature).layer.type === 'GPX'
    }
    profileStore.setProfileFeature(
        feature,
        {
            simplifyGeometry,
        },
        dispatcher
    )
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
