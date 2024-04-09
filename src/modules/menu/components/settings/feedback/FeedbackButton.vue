<script setup>
import { computed, nextTick, ref, toRefs } from 'vue'
import { useStore } from 'vuex'

import sendFeedbackApi from '@/api/feedback.api'
import HeaderLink from '@/modules/header/components/HeaderLink.vue'
import SendActionButtons from '@/modules/menu/components/settings/common/SendActionButtons.vue'
import FeedbackRating from '@/modules/menu/components/settings/feedback/FeedbackRating.vue'
import EmailValidationField from '@/utils/components/EmailValidationField.vue'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
import log from '@/utils/logging'
import { isValidEmail } from '@/utils/utils'

const props = defineProps({
    showAsLink: {
        type: Boolean,
        default: false,
    },
})

const { showAsLink } = toRefs(props)

const store = useStore()

const requestResults = ref(null)
const showFeedbackForm = ref(false)
const maxRating = ref(5)
const feedback = ref({ rating: 0, message: null, email: null })
const request = ref({ pending: false, failed: false, completed: false })

const activeKmlLayer = computed(() => store.getters.activeKmlLayer)
const feedbackCanBeSent = computed(
    () => feedback.value.rating !== 0 && !request.value.pending && isEmailValid.value
)
const isEmailValid = computed(() => !feedback.value.email || isValidEmail(feedback.value.email))

function ratingChange(newRating) {
    feedback.value.rating = newRating
}

async function sendFeedback() {
    // if the request was already sent, we don't allow the user to double send
    if (request.value.completed) {
        // we instead close the modal if he/she clicks on the check mark
        closeAndCleanForm()
        return
    }
    request.value.pending = true
    try {
        let subject = '[web-mapviewer]'
        if (feedback.value.rating && maxRating.value) {
            subject += ` [rating: ${feedback.value.rating}/${maxRating.value}]`
        }
        subject += ' User feedback'
        const feedbackSentSuccessfully = await sendFeedbackApi(subject, feedback.value.message, {
            kmlFileUrl: activeKmlLayer.value?.kmlFileUrl,
            email: feedback.value.email,
        })
        request.value.completed = feedbackSentSuccessfully
        request.value.failed = !feedbackSentSuccessfully
    } catch (err) {
        log.error('Error while sending feedback', err)
        request.value.failed = true
    } finally {
        request.value.pending = false
    }
    await nextTick()
    if (request.value.failed) {
        // scrolling down to make sure the message with request results is visible to the user
        requestResults.value.scrollIntoView()
    }
}

function closeAndCleanForm() {
    showFeedbackForm.value = false
    feedback.value.rating = 0
    feedback.value.message = null
    feedback.value.email = null
    // reset also the completed/failed state, so that the user can send another feedback later on
    request.value.failed = false
    request.value.completed = false
}
</script>

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
        class="btn btn-primary btn-sm m-1"
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

<style lang="scss" scoped>
.feedback-text {
    min-height: 7rem;
}
</style>
