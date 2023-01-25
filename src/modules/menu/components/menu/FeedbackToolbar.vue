<template>
    <div
        :class="{
            'feedback-menu p-1': !isDesktopMode,
            'feedback-header me-2': isDesktopMode,
        }"
    >
        <FeedbackButton  />
        <LinkButton />
    </div>
</template>

<script>
import FeedbackButton from '@/modules/menu/components/menu/FeedbackButton.vue'
import LinkButton from '@/modules/menu/components/menu/LinkButton.vue'
import { mapGetters } from 'vuex'

export default {
    components: {
        FeedbackButton,
        LinkButton,
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
