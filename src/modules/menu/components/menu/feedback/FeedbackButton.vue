<template>
    <HeaderLink v-if="showAsLink" :primary="true" @click="showFeedbackForm = true">
        <strong>{{ $t('test_map_give_feedback') }}</strong>
    </HeaderLink>
    <button v-else class="btn btn-primary btn-sm mx-1" @click="showFeedbackForm = true">
        {{ $t('test_map_give_feedback') }}
    </button>
    <ModalWithBackdrop v-if="showFeedbackForm" @close="showFeedbackForm = false">
        <FeedbackForm @cancel="showFeedbackForm = false" />
    </ModalWithBackdrop>
</template>

<script>
import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import FeedbackForm from '@/modules/menu/components/menu/feedback/FeedbackForm.vue'
import log from '@/utils/logging'
import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'

export default {
    components: { FeedbackForm, ModalWithBackdrop, HeaderLink },
    props: {
        showAsLink: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            showFeedbackForm: false,
            mailTo:
                'mailto:webgis@swisstopo.ch?subject=' +
                encodeURIComponent('Feedback to new viewer'),
        }
    },
    methods: {
        sendFeedback() {
            window.location = this.mailTo
            log.debug('sending feedback')
        },
    },
}
</script>
