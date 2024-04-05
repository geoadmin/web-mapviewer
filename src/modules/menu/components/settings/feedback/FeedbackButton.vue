<template>
    <HeaderLink
        v-if="showAsLink"
        primary
        data-cy="feedback-link-button"
        @click="showFeedbackForm = true"
    >
        <strong>{{ $t('test_map_give_feedback') }}</strong>
    </HeaderLink>
    <button
        v-else
        class="btn btn-primary btn-sm mx-1"
        data-cy="feedback-button"
        @click="showFeedbackForm = true"
    >
        {{ $t('test_map_give_feedback') }}
    </button>
    <ModalWithBackdrop
        v-if="showFeedbackForm"
        :title="request.completed ? '' : $t('test_map_give_feedback')"
        fluid
        @close="closeAndCleanForm"
    >
        <div v-if="!request.completed" class="p-2" data-cy="feedback-form">
            <span>{{ $t('feedback_rating_title') }}</span>
            <FeedbackRating
                class="my-4 text-center"
                :max-rating="maxRating"
                :disabled="request.pending"
                @rating-change="ratingChange"
            />
            <textarea
                v-model="feedback.message"
                :disabled="request.pending"
                class="form-control feedback-text"
                data-cy="feedback-text"
                :placeholder="$t('feedback_rating_text')"
            ></textarea>

            <EmailValidationField
                class="my-3"
                :disabled="request.pending"
                :label="'feedback_email'"
                @email-updated="feedback.email = $event"
            />

            <div class="my-4">
                <!-- eslint-disable vue/no-v-html-->
                <small v-html="$t('feedback_disclaimer')" />
                <!-- eslint-enable vue/no-v-html-->
            </div>
            <SendActionButtons
                class="text-end"
                :is-disabled="!feedbackCanBeSent"
                :is-pending="request.pending"
                @send="sendFeedback"
                @cancel="closeAndCleanForm"
            />
            <div
                v-if="request.failed"
                ref="requestResults"
                class="text-end text-danger mt-3"
                data-cy="feedback-failed-text"
            >
                <small>{{ $t('send_failed') }}</small>
            </div>
        </div>
        <div v-else class="p-2">
            <h6 class="text-success" data-cy="feedback-success-text">
                {{ $t('feedback_success_message') }}
            </h6>
            <button
                class="my-2 btn btn-light float-end"
                data-cy="feedback-close-successful"
                @click="closeAndCleanForm"
            >
                {{ $t('close') }}
            </button>
        </div>
    </ModalWithBackdrop>
</template>

<script>
import { mapGetters } from 'vuex'

import sendFeedback from '@/api/feedback.api'
import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import SendActionButtons from '@/modules/menu/components/settings/common/SendActionButtons.vue'
import FeedbackRating from '@/modules/menu/components/settings/feedback/FeedbackRating.vue'
import EmailValidationField from '@/utils/components/EmailValidationField.vue'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
import log from '@/utils/logging'
import { isValidEmail } from '@/utils/utils'

export default {
    components: {
        FeedbackRating,
        ModalWithBackdrop,
        HeaderLink,
        EmailValidationField,
        SendActionButtons,
    },
    props: {
        showAsLink: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            showFeedbackForm: false,
            maxRating: 5,
            userIsTypingEmail: false,
            feedback: {
                rating: 0,
                message: null,
                email: null,
            },
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
            return this.feedback.rating !== 0 && !this.request.pending && this.isEmailValid
        },
        isEmailValid() {
            return !this.feedback.email || isValidEmail(this.feedback.email)
        },
    },
    methods: {
        ratingChange(newRating) {
            this.feedback.rating = newRating
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
                let subject = '[web-mapviewer]'
                if (this.feedback.rating && this.maxRating) {
                    subject += ` [rating: ${this.feedback.rating}/${this.maxRating}]`
                }
                subject += ' User feedback'
                const feedbackSentSuccessfully = await sendFeedback(
                    subject,
                    this.feedback.message,
                    {
                        kmlFileUrl: this.activeKmlLayer?.kmlFileUrl,
                        email: this.feedback.email,
                    }
                )
                this.request.completed = feedbackSentSuccessfully
                this.request.failed = !feedbackSentSuccessfully
            } catch (err) {
                log.error('Error while sending feedback', err)
                this.request.failed = true
            } finally {
                this.request.pending = false
            }
            await this.$nextTick()
            if (this.request.failed) {
                // scrolling down to make sure the message with request results is visible to the user
                this.$refs.requestResults.scrollIntoView()
            }
        },
        closeAndCleanForm() {
            this.showFeedbackForm = false
            this.feedback.rating = 0
            this.feedback.message = null
            this.feedback.email = null
            // reset also the completed/failed state, so that the user can send another feedback later on
            this.request.failed = false
            this.request.completed = false
        },
    },
}
</script>

<style lang="scss" scoped>
.feedback-text {
    min-height: 7rem;
}
</style>