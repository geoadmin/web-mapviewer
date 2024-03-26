<template>
    <HeaderLink v-if="showAsLink" primary data-cy="report-problem-link-button" @click="openForm">
        <strong>{{ $t('problem_announcement') }}</strong>
    </HeaderLink>
    <button
        v-else
        class="btn btn-primary btn-sm mx-1"
        data-cy="report-problem-button"
        @click="openForm"
    >
        {{ $t('problem_announcement') }}
    </button>
    <ModalWithBackdrop
        v-if="showReportProblemForm"
        :title="request.completed ? '' : $t('problem_announcement')"
        fluid
        @close="closeAndCleanForm"
    >
        <div v-if="!request.completed" class="p-2" data-cy="report-problem-form">
            <div class="my-3">
                <span>{{ $t('feedback_description') }}</span>
                <div class="input-group has-validation">
                    <textarea
                        ref="feedbackMessageTextArea"
                        v-model="feedback.message"
                        :disabled="request.pending"
                        :class="{ 'is-invalid': !userIsTypingFeedback && !isMessageValid }"
                        class="form-control feedback-text"
                        data-cy="report-problem-text"
                        @focusin="userIsTypingFeedback = true"
                        @focusout="userIsTypingFeedback = false"
                    ></textarea>
                    <div class="invalid-feedback">{{ $t('feedback_empty_warning') }}</div>
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
                        data-cy="report-problem-email"
                        @focusin="userIsTypingEmail = true"
                        @focusout="userIsTypingEmail = false"
                    />
                    <div class="invalid-feedback">{{ $t('feedback_invalid_email') }}</div>
                </div>
            </div>
            <div class="my-3">
                <span>{{ $t('feedback_attachment') }}</span>
                <ImportFileLocal @file-selected="handleFile" />
            </div>
            <div class="my-4">
                <!-- eslint-disable vue/no-v-html-->
                <small v-html="$t('feedback_permalink')" />
                <!-- eslint-enable vue/no-v-html-->
                <a target="_blank" :href="shortLink">{{ $t('permalink') }}</a>
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
                    data-cy="submit-report-problem-button"
                    @click="sendFeedback"
                >
                    <FontAwesomeIcon
                        v-if="request.pending"
                        icon="spinner"
                        pulse
                        data-cy="report-problem-pending-icon"
                    />
                    <span v-else data-cy="report-problem-send-text">{{ $t('send') }}</span>
                </button>
            </div>
            <div
                v-if="request.failed"
                ref="requestResults"
                class="text-end text-danger mt-3"
                data-cy="report-problem-failed-text"
            >
                <small>{{ $t('send_failed') }}</small>
            </div>
        </div>
        <div v-else class="p-2">
            <h6 class="text-success" data-cy="report-problem-success-text">
                {{ $t('feedback_success_message') }}
            </h6>
            <button
                class="my-2 btn btn-light float-end"
                data-cy="report-problem-close-successful"
                @click="closeAndCleanForm"
            >
                {{ $t('close') }}
            </button>
        </div>
    </ModalWithBackdrop>
</template>

<script>
import sendFeedback from '@/api/feedback.api'
import { createShortLink } from '@/api/shortlink.api'
import ImportFileLocal from '@/modules/menu/components/advancedTools/ImportFile/ImportFileLocal.vue'
import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
import log from '@/utils/logging'

// comes from https://v2.vuejs.org/v2/cookbook/form-validation.html#Using-Custom-Validation
const EMAIL_REGEX =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default {
    components: {
        ModalWithBackdrop,
        HeaderLink,
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
            showReportProblemForm: false,
            userIsTypingFeedback: false,
            userIsTypingEmail: false,
            feedback: {
                message: null,
                kml: null, // used for the future (drawing)
                email: null,
                file: null,
            },
            request: {
                pending: false,
                failed: false,
                completed: false,
            },
            shortLink: '',
        }
    },
    computed: {
        feedbackCanBeSent() {
            return !this.request.pending && this.isEmailValid && this.isMessageValid
        },
        isMessageValid() {
            return this.feedback.message?.length > 0
        },
        isEmailValid() {
            return !this.feedback.email || EMAIL_REGEX.test(this.feedback.email)
        },
    },

    methods: {
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
                    '[web-mapviewer] Problem report', // subject
                    this.feedback.message,
                    undefined, // For the drawing layer, we send the KML file URL
                    this.feedback.email,
                    this.feedback.file
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
            if (this.request.failed) {
                this.$refs.requestResults.scrollIntoView()
            }
        },
        closeAndCleanForm() {
            this.showReportProblemForm = false
            this.feedback.message = null
            this.feedback.email = null
            this.feedback.file = false
            // reset also the completed/failed state, so that the user can send another feedback later on
            this.request.failed = false
            this.request.completed = false
        },
        handleFile(file) {
            this.feedback.file = file
        },
        async generateShortLink() {
            this.shortLink = await createShortLink(window.location.href)
        },
        openForm() {
            this.showReportProblemForm = true
            this.generateShortLink()
            this.$nextTick(() => {
                this.$refs.feedbackMessageTextArea.focus()
            })
        },
    },
}
</script>

<style lang="scss" scoped>
.feedback-text {
    min-height: 7rem;
}
</style>
