<script setup lang="ts">
import type { KMLLayer } from '@swissgeo/layers'
import type { ComputedRef } from 'vue'

import { feedbackAPI, filesAPI, shortLinkAPI } from '@swissgeo/api'
import { layerUtils } from '@swissgeo/layers/utils'
import log from '@swissgeo/log'
import { FEEDBACK_EMAIL_SUBJECT } from '@swissgeo/staging-config/constants'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'
import type { DropdownItem } from '@/utils/components/DropdownButton.vue'
import type { ValidationResult } from '@/utils/composables/useFieldValidation'

import { ENVIRONMENT } from '@/config'
import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import SendActionButtons from '@/modules/menu/components/help/common/SendActionButtons.vue'
import useDrawingStore from '@/store/modules/drawing'
import { OnlineMode } from '@/store/modules/drawing/types'
import useLayersStore from '@/store/modules/layers'
import useUIStore from '@/store/modules/ui'
import DropdownButton from '@/utils/components/DropdownButton.vue'
import EmailInput from '@/utils/components/EmailInput.vue'
import FileInput from '@/utils/components/FileInput.vue'
import SimpleWindow from '@/utils/components/SimpleWindow.vue'
import TextAreaInput from '@/utils/components/TextAreaInput.vue'

const dispatcher: ActionDispatcher = { name: 'ReportProblemButton.vue' }
const temporaryKmlId = filesAPI.getKmlUrl('temporary-kml-for-reporting-a-problem', ENVIRONMENT)

const acceptedFileTypes = ['.kml', '.gpx', '.pdf', '.zip', '.jpg', '.jpeg', '.png', '.kmz']

const { t } = useI18n()
const drawingStore = useDrawingStore()
const layersStore = useLayersStore()
const uiStore = useUIStore()

const feedbackCategories: DropdownItem<string>[] = [
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

const feedback = ref<{
    message?: string
    category?: string
    kml?: string
    email?: string
    file?: File
}>({})

const request = ref({
    pending: false,
    failed: false,
    completed: false,
})
const shortLink = ref('')
const userHasTriedToSubmit = ref(false)
const isMessageValid = ref(false)
// by default attachment and email are valid as they are optional
const isAttachmentValid = ref(true)
const isEmailValid = ref(true)

//  Computed properties
const showDrawingOverlay = computed(() => drawingStore.overlay.show)

const temporaryKml: ComputedRef<KMLLayer> = computed(
    () => layersStore.systemLayers.find((l) => l.id === `KML|${temporaryKmlId}`) as KMLLayer
)

const isTemporaryKmlValid = computed(
    () => (temporaryKml.value?.kmlData?.length ?? 0) <= feedbackAPI.KML_MAX_SIZE
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
        feedback.value.kml = temporaryKml.value?.kmlData ?? undefined
    },
    { deep: true }
)

async function sendReportProblem() {
    userHasTriedToSubmit.value = true

    if (!isFormValid.value && validationResult.value) {
        // scrolling down to make sure the message with validation result is visible to the user
        validationResult.value.scrollIntoView()
        return
    }

    request.value.pending = true
    try {
        if (feedback.value.message) {
            const feedbackSentSuccessfully = await feedbackAPI.sendFeedback(
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
        }
    } catch (err) {
        log.error({ messages: ['Error while sending feedback', err] })
        request.value.failed = true
    } finally {
        request.value.pending = false
    }
    await nextTick()
    // scrolling down to make sure the message with request results is visible to the user
    if (request.value.failed) {
        if (requestResults.value) {
            requestResults.value.scrollIntoView()
        }
    } else if (request.value.completed) {
        if (reportProblemCloseSuccessful.value) {
            reportProblemCloseSuccessful.value.focus()
        }
    }
}

function closeAndCleanForm() {
    showReportProblemForm.value = false

    // reset the state
    feedback.value = {}

    // reset also the completed/failed state, so that the user can send another feedback later on
    request.value.failed = false
    request.value.completed = false
    if (temporaryKml.value) {
        layersStore.removeSystemLayer(`KML|${temporaryKmlId}`, dispatcher)
        drawingStore.clearDrawingFeatures(dispatcher)
    }
}

function onTextValidate(validation: ValidationResult) {
    isMessageValid.value = validation.valid
}

function onAttachmentValidate(validation: ValidationResult) {
    isAttachmentValid.value = validation.valid
}

function onEmailValidate(validation: ValidationResult) {
    isEmailValid.value = validation.valid
}

async function generateShortLink() {
    const createdShortlink = await shortLinkAPI.createShortLink({
        url: window.location.href,
        staging: ENVIRONMENT
    })
    if (createdShortlink) {
        shortLink.value = createdShortlink
    }
}

function openForm() {
    if (!showAsLink) {
        uiStore.closeMenu(dispatcher)
    }
    showReportProblemForm.value = true
    generateShortLink().catch((_) => {})

    nextTick(() => {
        if (feedbackMessageTextArea.value) {
            feedbackMessageTextArea.value.focus()
        }
    }).catch((_) => {})
}

function toggleDrawingOverlay() {
    drawingStore.toggleDrawingOverlay(
        {
            kmlId: temporaryKmlId,
            title: 'feedback_drawing',
        },
        dispatcher
    )
    if (drawingStore.onlineMode === OnlineMode.Online) {
        drawingStore.setOnlineMode(OnlineMode.OfflineWhileOnline, dispatcher)
    } else if (drawingStore.onlineMode === OnlineMode.None) {
        drawingStore.setOnlineMode(OnlineMode.Offline, dispatcher)
    }
}

function selectItem(dropdownItem: DropdownItem<string>) {
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
                    'is-invalid': !feedback.category && userHasTriedToSubmit,
                }"
                @selectItem="selectItem"
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
                    :validate-when-pristine="userHasTriedToSubmit"
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
                        'is-valid':
                            isTemporaryKmlValid &&
                            temporaryKml &&
                            !layerUtils.isKmlLayerEmpty(temporaryKml),
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
                    :validate-when-pristine="userHasTriedToSubmit"
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
                    :validate-when-pristine="userHasTriedToSubmit"
                    :disabled="request.pending"
                    :max-file-size="feedbackAPI.ATTACHMENT_MAX_SIZE"
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
                :class="{ 'is-invalid': !isFormValid && userHasTriedToSubmit }"
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
