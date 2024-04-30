<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import FeedbackButton from '@/modules/menu/components/settings/feedback/FeedbackButton.vue'
import HelpLink from '@/modules/menu/components/settings/HelpLink.vue'
import MoreInfo from '@/modules/menu/components/settings/MoreInfo.vue'
import ReportProblemButton from '@/modules/menu/components/settings/ReportProblemButton.vue'

const props = defineProps({
    showAsLinks: {
        type: Boolean,
        default: false,
    },
})

const store = useStore()

// Computed properties
const hasGiveFeedbackButton = computed(() => store.getters.hasGiveFeedbackButton)
const hasReportProblemButton = computed(() => store.getters.hasReportProblemButton)
</script>

<template>
    <div
        :class="{
            container: !props.showAsLinks,
            'me-2': props.showAsLinks,
        }"
    >
        <FeedbackButton v-if="hasGiveFeedbackButton" :show-as-link="showAsLinks" />
        <ReportProblemButton v-if="hasReportProblemButton" :show-as-link="showAsLinks" />
        <MoreInfo :show-as-link="showAsLinks" />
        <HelpLink :show-as-link="showAsLinks" />
    </div>
</template>
