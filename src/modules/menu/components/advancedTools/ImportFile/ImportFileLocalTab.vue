<script setup>
import { computed, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import ImportFileButtons from '@/modules/menu/components/advancedTools/ImportFile/ImportFileButtons.vue'
import { handleFileContent } from '@/modules/menu/components/advancedTools/ImportFile/utils'
import { useImportButton } from '@/modules/menu/components/advancedTools/useImportButton'
import log from '@/utils/logging'

const LOCAL_UPLOAD_ACCEPT = '.kml,.KML,.gpx,.GPX'
const LOCAL_UPLOAD_MAX_SIZE = 250 * 1024 * 1024 // 250mb

const i18n = useI18n()
const store = useStore()

const props = defineProps({
    active: {
        type: Boolean,
        default: false,
    },
})
const { active } = toRefs(props)

// Reactive data
const buttonState = ref('default')
const importFileLocalInput = ref(null)
const selectedFile = ref(null)
const errorMessage = ref(null)
const isFormValid = ref(false)
const layerAdded = ref(false)

useImportButton(buttonState)

// Computed properties
const isValid = computed(() => !errorMessage.value && selectedFile.value && layerAdded.value)
const isInvalid = computed(() => errorMessage.value)
const filePathInfo = computed(() =>
    selectedFile.value ? `${selectedFile.value.name}, ${selectedFile.value.size / 1000} ko` : ''
)

watch(errorMessage, validateForm)
watch(selectedFile, validateForm)

// Methods
function onFileSelected(evt) {
    errorMessage.value = null

    const file = evt.target?.files[0]
    if (!file) {
        selectedFile.value = null
        errorMessage.value = 'no_file'
        return
    }

    // Validate
    importFileLocalInput.value = null
    selectedFile.value = file
    if (file.size > LOCAL_UPLOAD_MAX_SIZE) {
        errorMessage.value = 'file_too_large'
    }
}

async function loadFile() {
    buttonState.value = 'loading'

    if (!selectedFile.value) {
        errorMessage.value = 'no_file'
    } else {
        try {
            const content = await selectedFile.value.text()
            handleFileContent(store, content, selectedFile.value.name)
            layerAdded.value = true
        } catch (error) {
            errorMessage.value = 'invalid_kml_gpx_file_error'
            log.error(`Failed to load file`, error)
        }
    }

    if (!errorMessage.value) {
        buttonState.value = 'succeeded'
        setTimeout(() => (buttonState.value = 'default'), 3000)
    } else {
        buttonState.value = 'default'
    }
}

function validateForm() {
    layerAdded.value = false
    if (errorMessage.value) {
        isFormValid.value = false
    } else {
        isFormValid.value = true
    }
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
        <form class="needs-validation">
            <div class="input-group rounded needs-validation mb-2">
                <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="importFileLocalInput.click()"
                >
                    {{ i18n.t('browse') }}
                </button>
                <input
                    ref="importFileLocalInput"
                    type="file"
                    :accept="LOCAL_UPLOAD_ACCEPT"
                    hidden
                    data-cy="import-file-local-input"
                    @change="onFileSelected"
                />
                <input
                    type="text"
                    class="form-control import-input rounded-end import-file-local-input"
                    :class="{ 'is-valid': isValid, 'is-invalid': isInvalid }"
                    :placeholder="i18n.t('no_file')"
                    :value="filePathInfo"
                    readonly
                    required
                    data-cy="import-file-local-input-text"
                    @click="importFileLocalInput.click()"
                />
                <div
                    v-if="errorMessage"
                    class="invalid-feedback"
                    data-cy="import-file-local-invalid-feedback"
                >
                    {{ i18n.t(errorMessage) }}
                </div>
            </div>
        </form>
        <ImportFileButtons
            class="mt-2"
            :button-state="buttonState"
            :disabled="!isFormValid"
            @load-file="loadFile"
        />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.import-file-local-input {
    cursor: pointer;
}
.import-file-local-button-connect {
    cursor: pointer;
}
</style>
