<script setup>
import { computed, nextTick, ref } from 'vue'

import sendFeedback from '@/api/feedback.api'
import { createShortLink } from '@/api/shortlink.api'
import ImportFileLocal from '@/modules/menu/components/advancedTools/ImportFile/ImportFileLocal.vue'
import { isValidEmail } from '@/modules/menu/components/advancedTools/ImportFile/utils'
import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
import log from '@/utils/logging'

const props = defineProps({
    showAsLink: {
        type: Boolean,
        default: false,
    },
})
const feedbackMessageTextArea = ref(null)
const requestResults = ref(null)

const showReportProblemForm = ref(false)
const userIsTypingFeedback = ref(false)
const userIsTypingEmail = ref(false)
const feedback = ref({
    message: null,
    kml: null,
    email: null,
    file: null,
})
const request = ref({
    pending: false,
    failed: false,
    completed: false,
})
const shortLink = ref('')

//  Computed properties
const feedbackCanBeSent = computed(() => {
    return !request.value.pending && isEmailValid.value && isMessageValid.value
})
const isMessageValid = computed(() => feedback.value.message?.length > 0)
const isEmailValid = computed(() => {
    return !feedback.value.email || isValidEmail(feedback.value.email)
})

// Methods
async function sendReportProblem() {
    // if the request was already sent, we don't allow the user to double send
    if (request.value.completed) {
        // we instead close the modal if he/she clicks on the check mark
        closeAndCleanForm()
        return
    }

    request.value.pending = true
    try {
        const feedbackSentSuccessfully = await sendFeedback(
            '[web-mapviewer] Problem report', // subject
            feedback.value.message,
            undefined, // For the drawing layer, we send the KML file URL
            feedback.value.email,
            feedback.value.file
        )
        request.value.completed = feedbackSentSuccessfully
        request.value.failed = !feedbackSentSuccessfully
    } catch (err) {
        log.error('Error while sending feedback', err)
        request.value.failed = true
    } finally {
        request.value.pending = false
    }
    await nextTick()
    // scrolling down to make sure the message with request results is visible to the user
    if (request.value.failed) {
        requestResults.value.scrollIntoView()
    }
}
function closeAndCleanForm() {
    showReportProblemForm.value = false
    feedback.value.message = null
    feedback.value.email = null
    feedback.value.file = false
    // reset also the completed/failed state, so that the user can send another feedback later on
    request.value.failed = false
    request.value.completed = false
}
function handleFile(file) {
    feedback.value.file = file
}
async function generateShortLink() {
    shortLink.value = await createShortLink(window.location.href)
}
function openForm() {
    showReportProblemForm.value = true
    generateShortLink()
    nextTick(() => {
        feedbackMessageTextArea.value.focus()
    })
}
</script>

<template>
    <HeaderLink
        v-if="props.showAsLink"
        primary
        data-cy="report-problem-link-button"
        @click="openForm"
    >
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
                <small>{{ $t('feedback_permalink') }}</small>
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
                    @click="sendReportProblem"
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

<style lang="scss" scoped>
.feedback-text {
    min-height: 7rem;
}
</style>
