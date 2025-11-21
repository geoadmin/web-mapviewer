<script setup lang="ts">
import type { ErrorMessage } from '@swissgeo/log/Message'

import log from '@swissgeo/log'
import { computed, ref } from 'vue'

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

const selectedFile = defineModel<File | undefined>({ default: undefined })

// Reactive data
const loadingFile = ref(false)
const errorFileLoadingMessage = ref<ErrorMessage | undefined>()
const isFormValid = ref(false)
const importSuccessMessage = ref('')

const buttonState = computed(() => (loadingFile.value ? 'loading' : 'default'))

// Methods
async function loadFile() {
    importSuccessMessage.value = ''
    errorFileLoadingMessage.value = undefined
    loadingFile.value = true

    if (isFormValid.value && selectedFile.value) {
        try {
            await handleFileSource(selectedFile.value, false)
            importSuccessMessage.value = 'file_imported_success'
        } catch (error) {
            errorFileLoadingMessage.value = generateErrorMessageFromErrorType(
                error instanceof Error ? error : new Error(String(error))
            )
            log.error({
                title: 'ImportFileLocalTab.vue',
                messages: ['Failed to load file', error],
            })
        }
    }

    loadingFile.value = false
}

function validateForm(validation: ValidationResult) {
    isFormValid.value = validation.valid
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
            :force-invalid="!!errorFileLoadingMessage"
            :invalid-message="errorFileLoadingMessage?.msg"
            :invalid-message-extra-params="errorFileLoadingMessage?.params"
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
@import '@/scss/webmapviewer-bootstrap-theme';
</style>
