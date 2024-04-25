<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const emits = defineEmits(['close'])
const store = useStore()

const isClosing = ref(false)
const drawingTitle = computed(() => store.state.drawing.drawingOverlay.title)

const i18n = useI18n()

function onClose() {
    isClosing.value = true
    emits('close')
}
</script>

<template>
    <div class="drawing-header">
        <button
            class="drawing-header-close-button btn btn-dark"
            :disabled="isClosing"
            data-cy="drawing-header-close-button"
            @click="onClose"
        >
            <FontAwesomeIcon class="icon me-2" :icon="['fas', 'arrow-left']" />
            <span v-if="isClosing">
                {{ i18n.t('draw_file_saving') }}
            </span>
            <span v-else>
                {{ i18n.t('draw_back') }}
            </span>
        </button>
        <h1 class="drawing-header-title" data-cy="drawing-header-title">
            {{ i18n.t(drawingTitle) }}
        </h1>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@import 'src/scss/variables';
.drawing-header {
    position: relative;
    height: $header-height;
    width: 100%;
    background-color: #e6e6e6;
    box-shadow: 6px 6px 12px rgb(0 0 0 / 18%);
    display: grid;
    grid-template: 1fr / auto 1fr;
    place-items: center;
    &-title {
        font-size: 2rem;
        font-weight: 700;
    }
    &-close-button {
        margin-left: 10px;
    }
}
@include respond-above(lg) {
    .drawing-header {
        &-title {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
    }
}
</style>
