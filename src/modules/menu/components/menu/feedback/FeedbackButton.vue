<template>
    <HeaderLink v-if="showAsLink" :primary="true" @click="showFeedbackForm = true">
        <strong>{{ $t('test_map_give_feedback') }}</strong>
    </HeaderLink>
    <button v-else class="btn btn-primary btn-sm mx-1" @click="showFeedbackForm = true">
        {{ $t('test_map_give_feedback') }}
    </button>
    <ModalWithBackdrop
        v-if="showFeedbackForm"
        :title="$t('feedback_rating_title')"
        @close="showFeedbackForm = false"
    >
        <div class="p-2">
            <FeedbackRating
                class="mb-3 text-center"
                :max-rating="maxRating"
                @rating-change="ratingChange"
            />
            <textarea
                v-model="feedback"
                class="form-control"
                :placeholder="$t('feedback_rating_text')"
            ></textarea>
            <div class="my-4">
                <!-- eslint-disable vue/no-v-html-->
                <small v-html="$t('feedback_disclaimer')" />
                <!-- eslint-enable vue/no-v-html-->
            </div>
            <button
                :disabled="!feedbackCanBeSent"
                class="float-end btn btn-primary"
                @click="sendFeedback"
            >
                {{ $t('send') }}
            </button>
            <button class="float-end btn btn-light mx-2" @click="showFeedbackForm = false">
                {{ $t('cancel') }}
            </button>
        </div>
    </ModalWithBackdrop>
</template>

<script>
import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import log from '@/utils/logging'
import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'
import FeedbackRating from '@/modules/menu/components/menu/feedback/FeedbackRating.vue'
import sendFeedback from '@/api/feedback.api'
import { mapGetters } from 'vuex'

export default {
    components: { FeedbackRating, ModalWithBackdrop, HeaderLink },
    props: {
        showAsLink: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            showFeedbackForm: false,
            rating: 0,
            maxRating: 5,
            feedback: null,
            mailTo:
                'mailto:webgis@swisstopo.ch?subject=' +
                encodeURIComponent('Feedback to new viewer'),
        }
    },
    computed: {
        ...mapGetters(['activeKmlLayer']),
        feedbackCanBeSent() {
            return this.rating !== 0
        },
        mailToLink() {
            const rating =
                this.rating === 0 ? '[no rating]' : `[rating:${this.rating}/${this.maxRating}]`
            const title = encodeURIComponent(`[web-mapviewer] ${rating} Feedback`)
            return `mailto:webgis@swisstopo.ch?subject=${title}`
        },
    },
    methods: {
        ratingChange(newRating) {
            this.rating = newRating
        },
        sendFeedback() {
            log.debug('sending feedback with', {
                rating: this.rating,
                feedback: this.feedback,
            })
            sendFeedback(
                this.rating,
                this.maxRating,
                this.feedback,
                this.activeKmlLayer?.kmlFileUrl
            ).then(() => {
                this.showFeedbackForm = false
            })
        },
    },
}
</script>
