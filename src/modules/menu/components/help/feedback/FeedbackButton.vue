<script setup>
import { computed, nextTick, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import sendFeedbackApi from '@/api/feedback.api'
import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import SendActionButtons from '@/modules/menu/components/help/common/SendActionButtons.vue'
import FeedbackRating from '@/modules/menu/components/help/feedback/FeedbackRating.vue'
import EmailInput from '@/utils/components/EmailInput.vue'
import SimpleWindow from '@/utils/components/SimpleWindow.vue'
import TextAreaInput from '@/utils/components/TextAreaInput.vue'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'FeedbackButton.vue' }

const props = defineProps({
    showAsLink: {
        type: Boolean,
        default: false,
    },
})

const { showAsLink } = toRefs(props)

const store = useStore()
const i18n = useI18n()

const requestResults = ref(null)
const showFeedbackForm = ref(false)
const maxRating = ref(5)
const feedback = ref({ rating: 0, message: null, email: null })
const request = ref({ pending: false, failed: false, completed: false })
const validationResult = ref(null)
const activateValidation = ref(false)
const isMessageValid = ref(false)
// by default attachment and email are valid as they are optional
const isEmailValid = ref(true)

const activeKmlLayer = computed(() => store.getters.activeKmlLayer)
const isFormValid = computed(() => feedback.value.rating && isEmailValid.value)

function ratingChange(newRating) {
    feedback.value.rating = newRating
}

function validate() {
    activateValidation.value = true
    return isFormValid.value
}

async function sendFeedback() {
    if (!validate()) {
        // scrolling down to make sure the message with validation result is visible to the user
        validationResult.value.scrollIntoView()
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

function openForm() {
    if (!props.showAsLink) {
        store.dispatch('closeMenu', dispatcher)
    }
    showFeedbackForm.value = true
}

function closeAndCleanForm() {
    activateValidation.value = false
    showFeedbackForm.value = false
    feedback.value.rating = 0
    feedback.value.message = null
    feedback.value.email = null
    // reset also the completed/failed state, so that the user can send another feedback later on
    request.value.failed = false
    request.value.completed = false
}

function onTextValidate(valid) {
    isMessageValid.value = valid
}

function onEmailValidate(valid) {
    isEmailValid.value = valid
}
</script>

<template>
    <HeaderLink v-if="showAsLink" primary data-cy="feedback-link-button" small @click="openForm">
        <strong>{{ i18n.t('test_map_give_feedback') }}</strong>
    </HeaderLink>
    <button v-else class="btn btn-primary" data-cy="feedback-button" @click="openForm">
        {{ i18n.t('test_map_give_feedback') }}
    </button>
    <SimpleWindow
        v-if="showFeedbackForm"
        :title="request.completed ? '' : 'test_map_give_feedback'"
        movable
        @close="closeAndCleanForm"
    >
        <div v-if="!request.completed" class="p-2" data-cy="feedback-form">
            <div class="">
                <label class="fw-bold my-2">{{ i18n.t('feedback_rating_title') }}</label>
                <FeedbackRating
                    class="text-center"
                    :class="{ 'is-invalid': !isFormValid && activateValidation }"
                    :max-rating="maxRating"
                    :disabled="request.pending"
                    @rating-change="ratingChange"
                />
                <div class="invalid-feedback" data-cy="rating-required-invalid-feedback">
                    {{ i18n.t('field_required') }}
                </div>
            </div>
            <div class="my-3">
                <TextAreaInput
                    ref="feedbackMessageTextArea"
                    v-model="feedback.message"
                    placeholder="feedback_rating_text"
                    :disabled="request.pending"
                    data-cy="feedback"
                    :activate-validation="activateValidation"
                    @validate="onTextValidate"
                />
            </div>

            <div class="my-3">
                <EmailInput
                    v-model="feedback.email"
                    label="feedback_mail"
                    :disabled="request.pending"
                    :activate-validation="activateValidation"
                    data-cy="feedback"
                    @validate="onEmailValidate"
                />
            </div>

            <div class="my-4">
                <!-- eslint-disable vue/no-v-html-->
                <small v-html="i18n.t('feedback_disclaimer')" />
                <!-- eslint-enable vue/no-v-html-->
            </div>
            <SendActionButtons
                class="text-end"
                :class="{ 'is-invalid': !isFormValid && activateValidation }"
                :is-disabled="request.pending"
                :is-pending="request.pending"
                @send="sendFeedback"
                @cancel="closeAndCleanForm"
            />
            <div ref="validationResult" class="invalid-feedback text-end mt-2">
                {{ i18n.t('form_invalid') }}
            </div>
            <div
                v-if="request.failed"
                ref="requestResults"
                class="text-end text-danger mt-3"
                data-cy="feedback-failed-text"
            >
                {{ i18n.t('send_failed') }}
            </div>
        </div>
        <div v-else class="p-2">
            <h6 class="text-success" data-cy="feedback-success-text">
                {{ i18n.t('feedback_success_message') }}
            </h6>
            <button
                class="my-2 btn btn-light float-end"
                data-cy="feedback-close-successful"
                @click="closeAndCleanForm"
            >
                {{ i18n.t('close') }}
            </button>
        </div>
    </SimpleWindow>
</template>

<style lang="scss" scoped>
.feedback-text {
    min-height: 7rem;
}
</style>
