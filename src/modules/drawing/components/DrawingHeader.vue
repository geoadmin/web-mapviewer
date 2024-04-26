<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const emits = defineEmits(['close'])

const isClosing = ref(false)

const i18n = useI18n()

function onClose() {
    isClosing.value = true
    emits('close')
}
</script>

<template>
    <div class="p-1 bg-white shadow">
        <div class="d-flex gap-1 justify-content-center align-items-center">
            <button class="btn btn-dark" :disabled="isClosing" @click="onClose">
                <FontAwesomeIcon class="icon me-2" :icon="['fas', 'arrow-left']" />
                <span v-if="isClosing">
                    {{ i18n.t('draw_file_saving') }}
                </span>
                <span v-else>
                    {{ i18n.t('draw_back') }}
                </span>
            </button>
            <h2 class="flex-grow-1 fw-bold m-0 p-0 text-center">{{ i18n.t('draw_mode_title') }}</h2>
        </div>
    </div>
</template>
