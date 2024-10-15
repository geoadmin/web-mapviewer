<script setup>
import { AxiosError } from 'axios'
import { computed, onMounted, ref, toRefs, watch } from 'vue'

import ImportFileButtons from '@/modules/menu/components/advancedTools/ImportFile/ImportFileButtons.vue'
import generateErrorMessageFromErrorType from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/generateErrorMessageFromErrorType.utils'
import useImportFile from '@/modules/menu/components/advancedTools/ImportFile/useImportFile.composable'
import TextInput from '@/utils/components/TextInput.vue'
import log from '@/utils/logging'
import { isValidUrl } from '@/utils/utils'

const props = defineProps({
    active: {
        type: Boolean,
        default: false,
    },
})
const { active } = toRefs(props)

const { handleFileSource } = useImportFile()

// Reactive data
const loading = ref(false)
const fileUrlInput = ref(null)
const fileUrl = ref('')
const importSuccessMessage = ref('')
/** @type {Ref<ErrorMessage | null>} */
const errorFileLoadingMessage = ref(null)
const isFormValid = ref(false)
const activateValidation = ref(false)

const buttonState = computed(() => (loading.value ? 'loading' : 'default'))

watch(active, (value) => {
    if (value) {
        fileUrlInput.value.focus()
    }
})

onMounted(() => {
    // Focus on the URL field when opening the import tool
    fileUrlInput.value.focus()
})

// Methods

function validateUrl(url) {
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

function onUrlValidate(valid) {
    isFormValid.value = valid
}

function onUrlChange() {
    errorFileLoadingMessage.value = null
    importSuccessMessage.value = ''
}

async function loadFile() {
    importSuccessMessage.value = ''
    errorFileLoadingMessage.value = null
    if (!validateForm()) {
        return
    }
    loading.value = true

    try {
        await handleFileSource(fileUrl.value, false)
        importSuccessMessage.value = 'file_imported_success'
        setTimeout(() => (buttonState.value = 'default'), 3000)
    } catch (error) {
        log.error(`Failed to load file from url ${fileUrl.value}`, error)
        buttonState.value = 'default'
        errorFileLoadingMessage.value = generateErrorMessageFromErrorType(error)
    }
    loading.value = false
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
        <ImportFileButtons class="mt-2" :button-state="buttonState" @load-file="loadFile" />
    </div>
</template>
