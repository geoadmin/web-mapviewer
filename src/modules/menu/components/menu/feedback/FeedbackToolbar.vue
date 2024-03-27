<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import FeedbackButton from '@/modules/menu/components/menu/feedback/FeedbackButton.vue'
import MoreInfo from '@/modules/menu/components/menu/MoreInfo.vue'
import ReportProblemButton from '@/modules/menu/components/menu/reportProblem/ReportProblemButton.vue'

const props = defineProps({
    showAsLinks: {
        type: Boolean,
        default: false,
    },
})

const store = useStore()

const hasGiveFeedbackButton = computed(() => store.getters.hasGiveFeedbackButton)
const hasReportProblemButton = computed(() => store.getters.hasReportProblemButton)
</script>

<template>
    <div
        :class="{
            'feedback-menu p-1': !props.showAsLinks,
            'me-2': props.showAsLinks,
        }"
    >
        <FeedbackButton v-if="hasGiveFeedbackButton" :show-as-link="showAsLinks" />
        <ReportProblemButton v-if="hasReportProblemButton" :show-as-link="showAsLinks" />
        <MoreInfo :show-as-link="showAsLinks" />
    </div>
</template>
