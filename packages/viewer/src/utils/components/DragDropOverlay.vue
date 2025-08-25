<script setup>
import { useI18n } from 'vue-i18n'

import BlackBackdrop from '@/utils/components/BlackBackdrop.vue'

const { t } = useI18n()
</script>

<template>
    <div class="drag-n-drop-overlay">
        <BlackBackdrop />
        <div class="inner-overlay">
            <h2>{{ t('drop_me_here') }}</h2>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
.drag-n-drop-overlay {
    $drag-n-drop-z-index: 9999;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    cursor: copy;
    z-index: $drag-n-drop-z-index;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-content: stretch;

    .inner-overlay {
        $inner-overlay-border-width: 0.5rem;
        margin: $inner-overlay-border-width;
        border: $inner-overlay-border-width dashed $white;
        position: absolute;
        top: 0;
        left: 0;
        width: calc(100% - 2 * #{$inner-overlay-border-width});
        height: calc(100% - 2 * #{$inner-overlay-border-width});
        z-index: $drag-n-drop-z-index + 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-content: stretch;
        text-align: center;
        color: $white;
    }
}
</style>
