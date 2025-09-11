<script setup lang="js">
import log from '@swissgeo/log'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import sendFeedback, { ATTACHMENT_MAX_SIZE, KML_MAX_SIZE } from '@/api/feedback.api'
import { getKmlUrl } from '@/api/files.api'
import { createShortLink } from '@/api/shortlink.api'
import { FEEDBACK_EMAIL_SUBJECT } from '@/config/feedback.config'
import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import SendActionButtons from '@/modules/menu/components/help/common/SendActionButtons.vue'
import DropdownButton from '@/utils/components/DropdownButton.vue'
import EmailInput from '@/utils/components/EmailInput.vue'
import FileInput from '@/utils/components/FileInput.vue'
import SimpleWindow from '@/utils/components/SimpleWindow.vue'
import TextAreaInput from '@/utils/components/TextAreaInput.vue'

const dispatcher = { dispatcher: 'ReportProblemButton.vue' }
const temporaryKmlId = getKmlUrl('temporary-kml-for-reporting-a-problem')

const acceptedFileTypes = ['.kml', '.gpx', '.pdf', '.zip', '.jpg', '.jpeg', '.png', '.kmz']

const { t } = useI18n()
const store = useStore()
/** @type {DropdownItem[]} */
const feedbackCategories = [
    {
        id: 'background_map',
        title: 'feedback_category_background_map',
        value: 'background_map',
    },
    {
        id: 'thematic_map',
        title: 'feedback_category_thematic_map',
        value: 'thematic_map',
    },
    {
        id: 'application_service',
        title: 'feedback_category_application_service',
        value: 'application_service',
    },
    {
        id: 'other',
        title: 'feedback_category_other',
        value: 'other',
    },
]

const { showAsLink } = defineProps({
    showAsLink: {
        type: Boolean,
        default: false,
    },
})

const feedbackMessageTextArea = useTemplateRef('feedbackMessageTextArea')
const validationResult = useTemplateRef('validationResult')
const requestResults = useTemplateRef('requestResults')
const reportProblemCloseSuccessful = useTemplateRef('reportProblemCloseSuccessful')

const showReportProblemForm = ref(false)
const feedback = ref({
    message: null,
    category: null,
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
const activateValidation = ref(false)
const isMessageValid = ref(false)
// by default attachment and email are valid as they are optional
const isAttachmentValid = ref(true)
const isEmailValid = ref(true)

//  Computed properties
const showDrawingOverlay = computed(() => store.state.drawing.drawingOverlay.show)
const temporaryKml = computed(() =>
    store.state.layers.systemLayers.find((l) => l.id === temporaryKmlId)
)
const isTemporaryKmlValid = computed(
    () => (temporaryKml.value?.kmlData?.length ?? 0) <= KML_MAX_SIZE
)
const isFormValid = computed(
    () =>
        feedback.value.category &&
        isMessageValid.value &&
        isEmailValid.value &&
        isAttachmentValid.value &&
        isTemporaryKmlValid.value
)

watch(
    () => temporaryKml.value?.kmlData,
    () => {
        feedback.value.kml = temporaryKml.value?.kmlData ?? null
    },
    { deep: true }
)

// Methods

function validate() {
    activateValidation.value = true
    return isFormValid.value
}

async function sendReportProblem() {
    if (!validate()) {
        // scrolling down to make sure the message with validation result is visible to the user
        validationResult.value.scrollIntoView()
        return
    }

    request.value.pending = true
    try {
        const feedbackSentSuccessfully = await sendFeedback(
            FEEDBACK_EMAIL_SUBJECT,
            feedback.value.message,
            {
                category: feedback.value.category,
                email: feedback.value.email,
                attachment: feedback.value.file,
                kml: feedback.value.kml,
            }
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
    } else if (request.value.completed) {
        reportProblemCloseSuccessful.value.focus()
    }
}

function closeAndCleanForm() {
    activateValidation.value = false
    showReportProblemForm.value = false
    feedback.value.category = null
    feedback.value.message = null
    feedback.value.email = null
    feedback.value.file = null
    // reset also the completed/failed state, so that the user can send another feedback later on
    request.value.failed = false
    request.value.completed = false
    if (temporaryKml.value) {
        store.dispatch('removeSystemLayer', { layerId: temporaryKmlId, ...dispatcher })
        store.dispatch('clearDrawingFeatures', dispatcher)
    }
}

function onTextValidate(valid) {
    isMessageValid.value = valid
}

function onAttachmentValidate(valid) {
    isAttachmentValid.value = valid
}

function onEmailValidate(valid) {
    isEmailValid.value = valid
}

async function generateShortLink() {
    shortLink.value = await createShortLink(window.location.href)
}

function openForm() {
    if (!showAsLink) {
        store.dispatch('closeMenu', dispatcher)
    }
    showReportProblemForm.value = true
    generateShortLink()
    nextTick(() => {
        feedbackMessageTextArea.value.focus()
    })
}

function toggleDrawingOverlay() {
    store.dispatch('toggleDrawingOverlay', {
        online: false,
        kmlId: temporaryKmlId,
        title: 'feedback_drawing',
        ...dispatcher,
    })
}

function selectItem(dropdownItem) {
    feedback.value.category = dropdownItem.value
}
</script>

<template>
    <HeaderLink
        v-if="showAsLink"
        primary
        small
        data-cy="report-problem-link-button"
        @click="openForm"
    >
        <strong>{{ t('problem_announcement') }}</strong>
    </HeaderLink>
    <button
        v-else
        class="btn btn-primary"
        data-cy="report-problem-button"
        @click="openForm"
    >
        {{ t('problem_announcement') }}
    </button>
    <SimpleWindow
        v-if="showReportProblemForm"
        :title="request.completed ? '' : 'problem_announcement'"
        :hide="showDrawingOverlay"
        initial-position="top-right"
        movable
        data-cy="report-problem-window"
        @close="closeAndCleanForm"
    >
        <div
            v-if="!request.completed"
            class="report-problem"
            data-cy="report-problem-form"
        >
            <div class="fw-bold mb-2">
                {{ t('feedback_category') }}
            </div>
            <DropdownButton
                label="feedback_description"
                :title="
                    feedback.category ? `feedback_category_${feedback.category}` : 'select_category'
                "
                :items="feedbackCategories"
                :current-value="feedback.category"
                data-cy="report-problem-category"
                class="my-2"
                :class="{
                    'is-valid': feedback.category,
                    'is-invalid': !feedback.category && activateValidation,
                }"
                @select-item="selectItem"
            />
            <a
                :href="t('feedback_more_info_url')"
                target="_blank"
                class="more-info-link"
            >
                {{ t('feedback_more_info_text') }}
            </a>
            <div
                class="invalid-feedback"
                data-cy="text-area-input-invalid-feedback"
            >
                {{ t('category_not_selected_warning') }}
            </div>

            <div class="my-3">
                <TextAreaInput
                    ref="feedbackMessageTextArea"
                    v-model="feedback.message"
                    label="feedback_description"
                    :disabled="request.pending"
                    required
                    data-cy="report-problem-text-area"
                    :activate-validation="activateValidation"
                    invalid-message="feedback_empty_warning"
                    @validate="onTextValidate"
                />
            </div>
            <div>
                <div class="mb-2">
                    {{ t('feedback_drawing') }}
                </div>
                <button
                    class="btn"
                    :class="{
                        'is-valid': isTemporaryKmlValid && temporaryKml && !temporaryKml.isEmpty(),
                        'is-invalid': !isTemporaryKmlValid,
                        'btn-outline-primary': !isTemporaryKmlValid,
                        'btn-outline-group': isTemporaryKmlValid,
                    }"
                    :disabled="request.pending"
                    data-cy="report-problem-drawing-button"
                    @click="toggleDrawingOverlay"
                >
                    {{ t('draw_tooltip') }}
                </button>
                <div class="invalid-feedback ps-2">
                    {{ t('drawing_too_large') }}
                </div>
                <div
                    class="valid-feedback ps-2"
                    data-cy="report-problem-drawing-added-feedback"
                >
                    {{ t('drawing_attached') }}
                </div>
            </div>

            <div class="my-3">
                <EmailInput
                    v-model="feedback.email"
                    label="feedback_mail"
                    :disabled="request.pending"
                    :description="'no_email_feedback'"
                    :activate-validation="activateValidation"
                    data-cy="report-problem-email"
                    @validate="onEmailValidate"
                />
            </div>

            <div class="my-3">
                <FileInput
                    v-model="feedback.file"
                    label="feedback_attachment"
                    :accepted-file-types="acceptedFileTypes"
                    :placeholder="'feedback_placeholder'"
                    :activate-validation="activateValidation"
                    :disabled="request.pending"
                    :max-file-size="ATTACHMENT_MAX_SIZE"
                    data-cy="report-problem-file"
                    @validate="onAttachmentValidate"
                />
            </div>
            <div class="my-4">
                <div>
                    <small>{{ t('feedback_permalink') }}</small>
                    <a
                        target="_blank"
                        :href="shortLink"
                    >
                        {{ t('permalink') }}
                    </a>
                </div>
                <div>
                    <!-- eslint-disable vue/no-v-html-->
                    <small v-html="t('feedback_disclaimer')" />
                    <!-- eslint-enable vue/no-v-html-->
                </div>
            </div>
            <SendActionButtons
                class="text-end"
                :class="{ 'is-invalid': !isFormValid && activateValidation }"
                :is-disabled="request.pending"
                :is-pending="request.pending"
                @send="sendReportProblem"
                @cancel="closeAndCleanForm"
            />
            <div
                ref="validationResult"
                class="invalid-feedback mt-2 text-end"
            >
                {{ t('form_invalid') }}
            </div>
            <div
                v-if="request.failed"
                ref="requestResults"
                class="text-danger mt-2 text-end"
                data-cy="report-problem-failed-text"
            >
                <small>{{ t('send_failed') }}</small>
            </div>
        </div>
        <div
            v-else
            class="p-2"
        >
            <h6
                class="text-success"
                data-cy="report-problem-success-text"
            >
                {{ t('feedback_success_message') }}
            </h6>
            <button
                ref="reportProblemCloseSuccessful"
                class="btn btn-light float-end my-2"
                data-cy="report-problem-close-successful"
                @click="closeAndCleanForm"
            >
                {{ t('close') }}
            </button>
        </div>
    </SimpleWindow>
</template>

<style lang="scss" scoped>
.feedback-text {
    min-height: 7rem;
}
</style>
