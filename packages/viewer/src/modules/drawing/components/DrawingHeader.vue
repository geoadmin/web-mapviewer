<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import useDrawingStore from '@/store/modules/drawing.store'

import TextTruncate from '@/utils/components/TextTruncate.vue'

const { isClosingInToolbox } = defineProps({
    isClosingInToolbox: {
        type: Boolean,
        default: false,
    },
})

const emits = defineEmits<{ close: [] }>()
const drawingStore = useDrawingStore()

const isClosing = ref(false)
const isClosingWithWarning = computed(() => isClosing.value && isClosingInToolbox)
const drawingTitle = computed(() => drawingStore.drawingOverlay.title)

const { t } = useI18n()

function onClose() {
    isClosing.value = true
    emits('close')
}
</script>

<template>
    <div class="drawing-header d-flex justify-content-between align-items-center">
        <button
            class="drawing-header-close-button btn btn-dark"
            :disabled="isClosingWithWarning"
            data-cy="drawing-header-close-button"
            @click="onClose"
        >
            <FontAwesomeIcon
                class="icon me-2"
                :icon="['fas', 'arrow-left']"
            />
            <span v-if="isClosingWithWarning">
                {{ t('draw_file_saving') }}
            </span>
            <span v-else>
                {{ t('draw_back') }}
            </span>
        </button>
        <TextTruncate
            class="drawing-header-title px-2"
            data-cy="drawing-header-title"
        >
            {{ t(drawingTitle) }}
        </TextTruncate>
        <div>
            <!-- This empty div is needed to keep the title in the middle of the header it uses
            the d-flex justify-content-between functionality -->
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
@import '@/scss/variables.module';
.drawing-header {
    position: relative;
    height: $header-height;
    width: 100%;
    background-color: #e6e6e6;
    box-shadow: 6px 6px 12px rgb(0 0 0 / 18%);
    white-space: nowrap;
    &-title {
        font-size: 2rem;
        font-weight: 700;
    }
    &-close-button {
        margin-left: 10px;
    }
}

@include respond-below(lg) {
    .drawing-header {
        &-title {
            font-size: 1.5rem;
        }
    }
}
</style>
