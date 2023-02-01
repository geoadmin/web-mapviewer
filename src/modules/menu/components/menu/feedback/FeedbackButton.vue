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
            <div class="text-end">
                <button class="btn btn-light mx-2" @click="closeAndCleanForm">
                    <span v-if="request.completed">{{ $t('close') }}</span>
                    <span v-else>{{ $t('cancel') }}</span>
                </button>
                <button
                    :disabled="!feedbackCanBeSent"
                    class="btn btn-primary"
                    @click="sendFeedback"
                >
                    <FontAwesomeIcon v-if="request.pending" icon="spinner" pulse />
                    <FontAwesomeIcon v-else-if="request.completed" icon="check" />
                    <span v-else-if="request.failed">{{ $t('upload_failed') }}</span>
                    <span v-else>{{ $t('send') }}</span>
                </button>
            </div>
            <div v-if="request.completed || request.failed" class="text-end mt-3">
                <span>
                    <small v-if="request.failed" class="text-danger">
                        {{ $t('upload_failed') }}
                    </small>
                    <small v-if="request.completed">{{ $t('feedback_success_message') }}</small>
                </span>
            </div>
        </div>
    </ModalWithBackdrop>
</template>

<script>
import sendFeedback from '@/api/feedback.api'
import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import FeedbackRating from '@/modules/menu/components/menu/feedback/FeedbackRating.vue'
import log from '@/utils/logging'
import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'
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
            request: {
                pending: false,
                failed: false,
                completed: false,
            },
        }
    },
    computed: {
        ...mapGetters(['activeKmlLayer']),
        feedbackCanBeSent() {
            return this.rating !== 0 && !this.request.pending
        },
    },
    methods: {
        ratingChange(newRating) {
            this.rating = newRating
        },
        async sendFeedback() {
            // if the request was already sent, we don't allow the user to double send
            if (this.request.completed) {
                // we instead close the modal if he/she clicks on the check mark
                this.closeAndCleanForm()
                return
            }
            this.request.pending = true
            try {
                const feedbackSentSuccessfully = await sendFeedback(
                    this.rating,
                    this.maxRating,
                    this.feedback,
                    this.activeKmlLayer?.kmlFileUrl
                )
                this.request.completed = feedbackSentSuccessfully
                this.request.failed = !feedbackSentSuccessfully
            } catch (err) {
                log.error('Error while sending feedback', err)
                this.request.failed = true
            } finally {
                this.request.pending = false
            }
        },
        closeAndCleanForm() {
            this.showFeedbackForm = false
            this.rating = 0
            this.feedback = null
            // reset also the completed/failed state, so that the user can send another feedback later on
            this.request.failed = false
            this.request.completed = false
        },
    },
}
</script>
