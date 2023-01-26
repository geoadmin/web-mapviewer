<template>
    <HeaderLink v-if="isDesktopMode" :selected="true" @click="sendFeedback">
        {{ $t('test_map_give_feedback') }}
    </HeaderLink>
    <button v-else class="btn btn-primary btn-sm mx-1" @click="sendFeedback">
        {{ $t('test_map_give_feedback') }}
    </button>
</template>

<script>
import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import log from '@/utils/logging'
import { mapGetters } from 'vuex'

export default {
    components: { HeaderLink },
    data() {
        return {
            mailTo:
                'mailto:webgis@swisstopo.ch?subject=' +
                encodeURIComponent('Feedback to new viewer'),
        }
    },
    computed: {
        ...mapGetters(['isDesktopMode']),
    },
    methods: {
        sendFeedback() {
            window.location = this.mailTo
            log.debug('sending feedback')
        },
    },
}
</script>
