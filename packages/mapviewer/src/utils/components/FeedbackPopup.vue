<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import ErrorWindow from '@/utils/components/ErrorWindow.vue'
import WarningWindow from '@/utils/components/WarningWindow.vue'
const store = useStore()
const { t } = useI18n()
const error = computed(() => store.getters.getFirstError)
const warning = computed(() => store.getters.getFirstWarning)
</script>

<template>
    <div class="feedback-window">
        <ErrorWindow
            v-if="error"
            title="error"
            @close="store.dispatch('acknowledgedError', { error, ...dispatcher })"
        >
            <div>
                {{ t(error.msg, error.params) }}
            </div>
        </ErrorWindow>
        <WarningWindow
            v-if="warning"
            title="warning"
            @close="store.dispatch('acknowledgeWarning', { warning, ...dispatcher })"
        >
            <div>{{ t(warning.msg, warning.params) }}</div>
        </WarningWindow>
    </div>
</template>

<style lang="scss">
@import '@/scss/variables.module';
@import '@/scss/media-query.mixin';
@import '@/scss/webmapviewer-bootstrap-theme';
.feedback-window {
    $top-margin: calc(2 * $header-height + 2rem);
    z-index: calc($zindex-menu - 1);
    top: $top-margin;
    right: 4rem;
    width: max-content;
    max-width: 400px;
    max-height: calc(100vh - $top-margin);
    position: absolute;

    display: flex;
    flex-direction: column;
    @include respond-below(phone) {
        $top-margin: $header-height;

        left: 50%;
        right: unset;
        transform: translate(-50%, 0%);
        max-height: calc(100vh - $top-margin);
        max-width: 100vw;

        &.dev-disclaimer-present {
            $top-margin: calc($header-height + $dev-disclaimer-height + 1rem);
        }
        & {
            top: $top-margin;
        }
    }
}
</style>
