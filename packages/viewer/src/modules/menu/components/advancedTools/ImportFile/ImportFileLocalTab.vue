<script setup lang="ts">
import type { ErrorMessage } from '@swissgeo/log/Message'

import log from '@swissgeo/log'
import { computed, ref, watch } from 'vue'

import type { ValidationResult } from '@/utils/composables/useFieldValidation'

import ImportFileButtons from '@/modules/menu/components/advancedTools/ImportFile/ImportFileButtons.vue'
import generateErrorMessageFromErrorType from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/generateErrorMessageFromErrorType.utils'
import useImportFile from '@/modules/menu/components/advancedTools/ImportFile/useImportFile.composable'
import FileInput from '@/utils/components/FileInput.vue'

const acceptedFileTypes = ['.kml', '.kmz', '.gpx', '.tif', '.tiff']

const { handleFileSource } = useImportFile()

const { active = false } = defineProps<{
    active?: boolean
}>()

// Reactive data
const loadingFile = ref(false)
const selectedFile = ref<File | undefined>()
const errorFileLoadingMessage = ref<ErrorMessage | undefined>()
const isFormValid = ref(false)
const activateValidation = ref(false)
const importSuccessMessage = ref('')

const buttonState = computed(() => (loadingFile.value ? 'loading' : 'default'))

// Debug watchers
watch(importSuccessMessage, (newVal) => {
    console.log('[ImportFileLocalTab] importSuccessMessage changed to:', newVal)
})
watch(errorFileLoadingMessage, (newVal) => {
    console.log('[ImportFileLocalTab] errorFileLoadingMessage changed to:', newVal?.msg)
})
watch(selectedFile, (newVal) => {
    console.log('[ImportFileLocalTab] selectedFile changed to:', newVal?.name)
    // Clear previous error/success messages when a new file is selected
    importSuccessMessage.value = ''
    errorFileLoadingMessage.value = undefined
})

// Methods
async function loadFile() {
    console.log('[ImportFileLocalTab] loadFile called')
    activateValidation.value = true

    console.log('[ImportFileLocalTab] isFormValid:', isFormValid.value, 'selectedFile:', selectedFile.value?.name)
    if (!isFormValid.value || !selectedFile.value) {
        console.log('[ImportFileLocalTab] Skipping load - form invalid or no file selected')
        return
    }

    console.log('[ImportFileLocalTab] Attempting load')
    loadingFile.value = true

    try {
        console.log('[ImportFileLocalTab] Attempting to load file:', selectedFile.value.name)
        await handleFileSource(selectedFile.value, false)
        console.log('[ImportFileLocalTab] File loaded successfully')
        importSuccessMessage.value = 'file_imported_success'
    } catch (error) {
        console.log('[ImportFileLocalTab] File load error:', error)
        errorFileLoadingMessage.value = generateErrorMessageFromErrorType(
            error instanceof Error ? error : new Error(String(error))
        )
        console.log('[ImportFileLocalTab] errorFileLoadingMessage set to:', errorFileLoadingMessage.value)
        log.error({
            title: 'ImportFileLocalTab.vue',
            messages: ['Failed to load file', error],
        })
    }

    loadingFile.value = false
    console.log('[ImportFileLocalTab] loadFile complete. Success:', importSuccessMessage.value, 'Error:', errorFileLoadingMessage.value?.msg)
}

function validateForm(valid: ValidationResult) {
    console.log('[ImportFileLocalTab] validateForm called:', valid)
    isFormValid.value = valid.valid
}
</script>

<template>
    <div
        id="nav-local"
        class="tab-pane fade"
        :class="{
            active: active,
            show: active,
        }"
        role="tabpanel"
        aria-labelledby="nav-local-tab"
        data-cy="import-file-local-content"
    >
        <FileInput
            v-model="selectedFile"
            required
            :accepted-file-types="acceptedFileTypes"
            :placeholder="'no_file'"
            :activate-validation="activateValidation"
            :force-invalid="!!errorFileLoadingMessage"
            :invalid-message="errorFileLoadingMessage?.msg"
            :invalid-message-extra-params="errorFileLoadingMessage?.params"
            :force-valid="!!importSuccessMessage"
            :valid-message="importSuccessMessage"
            @validate="validateForm"
        />
        <ImportFileButtons
            class="mt-2"
            :button-state="buttonState"
            @load-file="loadFile"
        />
    </div>
</template>

<style lang="scss" scoped>
@import '@swissgeo/theme/scss/geoadmin-theme';
</style>
