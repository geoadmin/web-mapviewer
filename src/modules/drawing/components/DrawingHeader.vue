<template>
    <div class="drawing-header">
        <button class="drawing-header-close-button btn btn-dark" @click="$emit('close')">
            <FontAwesomeIcon class="icon me-2" :icon="['fas', 'arrow-left']" />
            {{ $t('draw_back') }}
        </button>
        <h1 class="drawing-header-title">{{ $t('draw_mode_title') }}</h1>
    </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
    components: { FontAwesomeIcon },
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
