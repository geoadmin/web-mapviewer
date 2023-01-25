<template>
    <button
        class="feedback-btn btn"
        :class="{
            // Desktop mode classes
            'm-0 px-1 btn-xs btn-link custom-text-decoration': isDesktopMode,
            'text-black': isDesktopMode,
            // Mobile/tablet mode classes
            'mobile-view btn-sm mx-1': !isDesktopMode,
            'btn-light': !isDesktopMode,
        }"
        :title="$t('app_feedback_button_title')"
        @click="sendFeedback"
    >
    {{ $t('test_map_give_feedback') }}
    </button>
</template>

<script>


import log from '@/utils/logging'
import { mapGetters } from 'vuex'

export default {
    data() {
      return {
        mailTo: "mailto:webgis@swisstopo.ch?subject=" +
          encodeURIComponent("Feedback to new viewer"),
      }
    },
    computed: {
        ...mapGetters(['isDesktopMode']),
    },
    methods: {
        sendFeedback() {
            window.location = this.mailTo;
            log.debug('sending feedback')
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.mobile-view {
    width: 40px;
}

.custom-text-decoration {
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
}
</style>
