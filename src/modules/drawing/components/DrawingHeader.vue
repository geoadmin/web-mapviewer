<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'

const emits = defineEmits(['close'])

const i18n = useI18n()
</script>

<template>
    <div class="drawing-header">
        <button class="drawing-header-close-button btn btn-dark" @click="emits('close')">
            <FontAwesomeIcon class="icon me-2" :icon="['fas', 'arrow-left']" />
            {{ i18n.t('draw_back') }}
        </button>
        <h1 class="drawing-header-title">{{ i18n.t('draw_mode_title') }}</h1>
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
