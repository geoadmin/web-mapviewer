<script setup>
import { computed, toRef } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()
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
const toggleImportFile = () => store.dispatch('toggleImportFile')

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
    <div class="mt-2 d-grid gap-2 d-md-flex justify-content-md-center">
        <button
            type="button"
            class="btn btn-outline-secondary me-md-3 import-file-btn-connect"
            :disabled="isLoading || disabled"
            data-cy="import-load-button"
            @click="emit('loadFile')"
        >
            {{ i18n.t(buttonI18nKey) }}
            <font-awesome-icon v-if="isLoading" class="ms-3" spin :icon="['fa', 'spinner']" />
        </button>
        <button
            type="button"
            class="btn btn-outline-secondary import-file-btn-close"
            data-cy="import-close-button"
            @click="toggleImportFile()"
        >
            {{ i18n.t('close') }}
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.import-file-btn-connect,
.import-file-btn-close {
    cursor: pointer;
    min-width: 25%;
}
</style>
