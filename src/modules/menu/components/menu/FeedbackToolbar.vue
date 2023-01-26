<template>
    <div
        :class="{
            'feedback-menu p-1': !isDesktopMode,
            'me-2': isDesktopMode,
        }"
    >
        <FeedbackButton  />
        <FeedbackMoreInfo />
    </div>
</template>

<script>
import FeedbackButton from '@/modules/menu/components/menu/FeedbackButton.vue'
import FeedbackMoreInfo from '@/modules/menu/components/menu/FeedbackMoreInfo.vue'
import { mapGetters } from 'vuex'

export default {
    components: {
        FeedbackButton,
        FeedbackMoreInfo,
    },
    computed: {
        ...mapGetters(['isDesktopMode']),
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.feedback-menu {
    transition: max-height 0.3s linear;
}
</style>
