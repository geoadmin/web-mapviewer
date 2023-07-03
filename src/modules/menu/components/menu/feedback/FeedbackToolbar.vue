<template>
    <div
        :class="{
            'feedback-menu p-1': !showAsLinks,
            'me-2': showAsLinks,
        }"
    >
        <FeedbackButton :show-as-link="showAsLinks" />
        <MoreInfo :show-as-link="showAsLinks" />
    </div>
</template>

<script>
import FeedbackButton from '@/modules/menu/components/menu/feedback/FeedbackButton.vue'
import MoreInfo from '@/modules/menu/components/menu/MoreInfo.vue'

export default {
    components: {
        FeedbackButton,
        MoreInfo,
    },
    props: {
        showAsLinks: {
            type: Boolean,
            default: false,
        },
    },
}
</script>
