<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import SelectableFeature from '@/api/features/SelectableFeature.class'

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
    store.dispatch('setProfileFeature', { feature: feature.value, ...dispatcher })
}
</script>

<template>
    <button class="btn btn-xs btn-outline-secondary" data-cy="show-profile" @click="showProfile">
        <FontAwesomeIcon icon="fa-chart-area" class="me-1" />
        <span>{{ i18n.t('display_profile') }}</span>
    </button>
</template>
