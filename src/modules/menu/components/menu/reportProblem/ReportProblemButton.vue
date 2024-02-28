<template>
    <HeaderLink
        v-if="showAsLink"
        :primary="true"
        data-cy="feedback-link-button"
        @click="showFeedbackForm = true"
    >
        <strong>{{ $t('problem_announcement') }}</strong>
    </HeaderLink>
    <button
        v-else
        class="btn btn-primary btn-sm mx-1"
        data-cy="feedback-button"
        @click="showFeedbackForm = true"
    >
        {{ $t('problem_announcement') }}
    </button>
    <ModalWithBackdrop
        v-if="showFeedbackForm"
        :title="request.completed ? '' : $t('problem_announcement')"
        fluid
        @close="closeAndCleanForm"
    >
        <div v-if="!request.completed" class="p-2" data-cy="report-problem-form">
            <span>{{ $t('feedback_description') }}</span>
            <textarea
                v-model="feedback.message"
                :disabled="request.pending"
                class="form-control feedback-text"
                data-cy="feedback-text"
            ></textarea>
            <div class="my-3">
                <span>{{ $t('feedback_drawing') }}</span>
                <div>
                    <DrawingToolboxButton
                        :drawing-mode="EditableFeatureTypes.MARKER"
                        :is-active="true"
                        :data-cy="`drawing-toolbox-mode-button-marker`"
                        @set-drawing-mode="selectDrawingMode"
                    />
                    <DrawingToolboxButton
                        :drawing-mode="EditableFeatureTypes.LINEPOLYGON"
                        :is-active="true"
                        :data-cy="`drawing-toolbox-mode-button-marker`"
                        @set-drawing-mode="selectDrawingMode"
                    />
                    <!-- <DrawingInteractions ref="drawingInteractions" /> -->
                </div>
            </div>
            <div class="my-3">
                <span>{{ $t('feedback_mail') }}</span>
                <div class="input-group has-validation">
                    <input
                        v-model="feedback.email"
                        :disabled="request.pending"
                        :class="{ 'is-invalid': !userIsTypingEmail && !isEmailValid }"
                        type="email"
                        class="form-control"
                        data-cy="feedback-email"
                        @focusin="userIsTypingEmail = true"
                        @focusout="userIsTypingEmail = false"
                    />
                    <div class="invalid-feedback">{{ $t('feedback_invalid_email') }}</div>
                </div>
            </div>
            <div class="my-3">
                <span>{{ $t('feedback_attachment') }}</span>
                <ImportFileLocal :active="true" />
            </div>
            <div class="my-4">
                <!-- eslint-disable vue/no-v-html-->
                <small v-html="$t('feedback_permalink')" />
                <!-- eslint-enable vue/no-v-html-->
            </div>
            <div class="my-4">
                <!-- eslint-disable vue/no-v-html-->
                <small v-html="$t('feedback_disclaimer')" />
                <!-- eslint-enable vue/no-v-html-->
            </div>
            <div class="text-end">
                <button class="btn btn-light mx-2" @click="closeAndCleanForm">
                    {{ $t('cancel') }}
                </button>
                <button
                    :disabled="!feedbackCanBeSent"
                    class="btn btn-primary"
                    data-cy="submit-feedback-button"
                    @click="sendFeedback"
                >
                    <FontAwesomeIcon
                        v-if="request.pending"
                        icon="spinner"
                        pulse
                        data-cy="feedback-pending-icon"
                    />
                    <span v-else data-cy="feedback-send-text">{{ $t('send') }}</span>
                </button>
            </div>
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

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import sendFeedback from '@/api/feedback.api'
// import DrawingInteractions from '@/modules/drawing/components/DrawingInteractions.vue'
import DrawingToolboxButton from '@/modules/drawing/components/DrawingToolboxButton.vue'
// import ImportFile from '@/modules/menu/components/advancedTools/ImportFile/ImportFile.vue'
import ImportFileLocal from '@/modules/menu/components/advancedTools/ImportFile/ImportFileLocal.vue'
import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
import log from '@/utils/logging'

// comes from https://v2.vuejs.org/v2/cookbook/form-validation.html#Using-Custom-Validation
const EMAIL_REGEX =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default {
    components: {
        DrawingToolboxButton,
        ModalWithBackdrop,
        HeaderLink,
        // DrawingInteractions,
        // ImportFile,
        ImportFileLocal,
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
            drawingInteractions: null,
            EditableFeatureTypes,
        }
    },
    computed: {
        ...mapGetters(['activeKmlLayer']),
        feedbackCanBeSent() {
            return this.feedback.rating !== 0 && !this.request.pending && this.isEmailValid
        },
        isEmailValid() {
            return !this.feedback.email || EMAIL_REGEX.test(this.feedback.email)
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
                const feedbackSentSuccessfully = await sendFeedback(
                    this.feedback.message,
                    this.feedback.rating,
                    this.maxRating,
                    this.activeKmlLayer?.kmlFileUrl,
                    this.feedback.email
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
            // scrolling down to make sure the message with request results is visible to the user
            this.$refs.requestResults.scrollIntoView()
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
