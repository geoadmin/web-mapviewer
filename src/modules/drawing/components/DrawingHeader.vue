<template>
    <div class="drawing-header">
        <ButtonWithIcon
            class="drawing-header-close-button"
            :button-font-awesome-icon="['fas', 'arrow-left']"
            :button-title="$t('draw_back')"
            icons-before-text
            dark
            @click="$emit('close')"
        >
        </ButtonWithIcon>
        <h1 class="drawing-header-title">{{ $t('draw_mode_title') }}</h1>
    </div>
</template>

<script>
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'

export default {
    components: { ButtonWithIcon },
    emits: ['close'],
}
</script>

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
