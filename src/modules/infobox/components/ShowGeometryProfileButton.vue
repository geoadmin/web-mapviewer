<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toRefs } from 'vue'
import { useStore } from 'vuex'

import SelectableFeature from '@/api/features/SelectableFeature.class'
import { useTippyTooltip } from '@/utils/useTippyTooltip'

const dispatcher = { dispatcher: 'ShowGeometryProfileButton.vue' }

const props = defineProps({
    feature: {
        type: SelectableFeature,
        required: true,
    },
})
const { feature } = toRefs(props)

useTippyTooltip('.show-profile-button', { placement: 'top' })

const store = useStore()

function showProfile() {
    store.dispatch('setProfileFeature', { feature: feature.value, ...dispatcher })
}
</script>

<template>
    <button
        class="show-profile-button btn btn-xs text-secondary"
        data-tippy-content="display_profile"
        @click="showProfile"
    >
        <FontAwesomeIcon icon="fa-chart-area" />
    </button>
</template>