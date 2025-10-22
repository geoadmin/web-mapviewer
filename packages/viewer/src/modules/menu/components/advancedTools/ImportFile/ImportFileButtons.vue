<script setup lang="ts">
import useUIStore from '@/store/modules/ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ActionDispatcher } from '@/store/types'

const dispatcher: ActionDispatcher = { name: 'ImportFileButtons.vue' }

const emit = defineEmits<{
    loadFile: [void]
}>()

const uiStore = useUIStore()
const { t } = useI18n()

const { buttonState = 'default', disabled = false } = defineProps<{
    buttonState?: 'default' | 'loading' | 'succeeded'
    disabled?: boolean
}>()

// Store mapping (input)
const toggleImportFile = () => uiStore.toggleImportFile(dispatcher)

// Computed properties
const buttonI18nKey = computed<string>(() => {
    switch (buttonState) {
        case 'loading':
            return 'loading_file'
        case 'succeeded':
            return 'import_file_succeeded'
        case 'default':
        default:
            return 'import'
    }
})
const isLoading = computed<boolean>(() => buttonState === 'loading')
</script>

<template>
    <div class="d-grid d-md-flex justify-content-md-center gap-2">
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
