<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

import log from '@swissgeo/log'
import { ErrorMessage, WarningMessage } from '@swissgeo/log/Message'
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'

import type { ActionDispatcher } from '@/store/types'
import type { TextInputExposed, TextInputValidateResult } from '@/utils/components/TextInput.vue'

import ImportFileButtons from '@/modules/menu/components/advancedTools/ImportFile/ImportFileButtons.vue'
import generateErrorMessageFromErrorType from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/generateErrorMessageFromErrorType.utils'
import useImportFile from '@/modules/menu/components/advancedTools/ImportFile/useImportFile.composable'
import useUIStore from '@/store/modules/ui'
import TextInput from '@/utils/components/TextInput.vue'
import { isValidUrl } from '@/utils/utils'

const dispatcher: ActionDispatcher = {
    name: 'Import File Online Tab',
}

const { active } = defineProps<{
    active: boolean
}>()

const uiStore = useUIStore()

const { handleFileSource } = useImportFile()

// Reactive data
const isLoading = ref<boolean>(false)
const fileUrlInput = useTemplateRef<ComponentPublicInstance<TextInputExposed>>('fileUrlInput')
const fileUrl = ref<string>('')
const importSuccessMessage = ref<string>('')
const errorFileLoadingMessage = ref<ErrorMessage | undefined>()
const isFormValid = ref<boolean>(false)
const activateValidation = ref<boolean>(false)

const buttonState = computed<'loading' | 'default'>(() => (isLoading.value ? 'loading' : 'default'))

watch(
    () => active,
    (value) => {
        if (value && fileUrlInput.value) {
            fileUrlInput.value.focus()
        }
    }
)

onMounted(() => {
    // Focus on the URL field when opening the import tool
    if (fileUrlInput.value) {
        fileUrlInput.value.focus()
    }
})

// Methods

function validateUrl(url?: string): TextInputValidateResult {
    if (!url) {
        return { valid: false, invalidMessage: 'no_url' }
    } else if (!isValidUrl(url)) {
        return { valid: false, invalidMessage: 'invalid_url' }
    }
    return { valid: true, invalidMessage: '' }
}

function validateForm() {
    activateValidation.value = true
    return isFormValid.value
}

function onUrlValidate(result: TextInputValidateResult) {
    isFormValid.value = result.valid
}

function onUrlChange() {
    errorFileLoadingMessage.value = undefined
    importSuccessMessage.value = ''
}

async function loadFile() {
    importSuccessMessage.value = ''
    errorFileLoadingMessage.value = undefined
    if (!validateForm()) {
        return
    }
    isLoading.value = true

    try {
        await handleFileSource(fileUrl.value, false)
        if (!fileUrl.value.match(/^https:\/\//)) {
            uiStore.addWarnings(
                new WarningMessage('import_http_external_file_warning', {}),
                dispatcher
            )
        }
        isLoading.value = false
        importSuccessMessage.value = 'file_imported_success'
    } catch (error) {
        log.error({
            title: 'Import File Online Tab',
            messages: [`Failed to load file from url ${fileUrl.value}`, error],
        })
        isLoading.value = false
        if (error instanceof Error) {
            errorFileLoadingMessage.value = generateErrorMessageFromErrorType(error)
        }
    }
}
</script>

<template>
    <!-- Online Tab -->
    <div
        id="nav-online"
        class="tab-pane fade"
        :class="{
            active: active,
            show: active,
        }"
        role="tabpanel"
        aria-labelledby="nav-online-tab"
        data-cy="import-file-online-content"
    >
        <div>
            <TextInput
                ref="fileUrlInput"
                v-model="fileUrl"
                required
                class="mb-2"
                placeholder="import_file_url_placeholder"
                :activate-validation="activateValidation"
                :invalid-marker="!!errorFileLoadingMessage"
                :invalid-message="errorFileLoadingMessage?.msg"
                :invalid-message-params="errorFileLoadingMessage?.params"
                :valid-message="importSuccessMessage"
                :validate="validateUrl"
                data-cy="import-file-online-url"
                @validate="onUrlValidate"
                @change="onUrlChange"
                @keydown.enter.prevent="loadFile"
            />
        </div>
        <ImportFileButtons
            class="mt-2"
            :button-state="buttonState"
            @load-file="loadFile"
        />
    </div>
</template>
