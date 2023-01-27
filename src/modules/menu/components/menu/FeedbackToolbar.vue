<template>
    <div
        :class="{
            'feedback-menu p-1': !isDesktopMode,
            'me-2': isDesktopMode,
        }"
    >
        <FeedbackButton  />
        <MoreInfo />
    </div>
</template>

<script>
import FeedbackButton from '@/modules/menu/components/menu/FeedbackButton.vue'
import MoreInfo from '@/modules/menu/components/menu/MoreInfo.vue'
import { mapGetters } from 'vuex'

export default {
    components: {
        FeedbackButton,
        MoreInfo,
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
