<script setup>
import { computed, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const dispatcher = { dispatcher: 'ImportFileButtons.vue' }

const { t } = useI18n()
const store = useStore()
const emit = defineEmits(['loadFile'])

// Props
const props = defineProps({
    buttonState: {
        type: String,
        default: 'default',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
})

// Reactive data
const buttonState = toRef(props, 'buttonState')

// Store mapping (input)
const toggleImportFile = () => store.dispatch('toggleImportFile', dispatcher)

// Computed properties
const buttonI18nKey = computed(() => {
    switch (buttonState.value) {
        case 'loading':
            return 'loading_file'
        case 'succeeded':
            return 'import_file_succeeded'
        case 'default':
        default:
            return 'import'
    }
})
const isLoading = computed(() => buttonState.value === 'loading')
</script>

<template>
    <div class="d-grid gap-2 d-md-flex justify-content-md-center">
        <button
            type="button"
            class="btn btn-outline-group me-md-3 import-file-btn-connect"
            :disabled="isLoading || disabled"
            data-cy="import-file-load-button"
            @click="emit('loadFile')"
        >
            {{ t(buttonI18nKey) }}
            <font-awesome-icon
                v-if="isLoading"
                class="ms-3"
                spin
                :icon="['fa', 'spinner']"
            />
        </button>
        <button
            type="button"
            class="btn btn-outline-group import-file-btn-close"
            data-cy="import-file-close-button"
            @click="toggleImportFile()"
        >
            {{ t('close') }}
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.import-file-btn-connect,
.import-file-btn-close {
    cursor: pointer;
    min-width: 25%;
}
</style>
