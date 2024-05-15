<script setup>
import { toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    title: {
        type: String,
        default: '',
    },
    /**
     * Hide the modal with backdrop, can be used to temporarily hide the modal without loosing its
     * content
     */
    hide: {
        type: Boolean,
        default: false,
    },
})
const { title, hide } = toRefs(props)

const i18n = useI18n()

const emit = defineEmits(['close'])
</script>

<template>
    <teleport to="#main-component">
        <div v-show="!hide" class="simple-window card">
            <div
                class="window-header card-header d-flex align-items-center justify-content-sm-end"
                data-cy="window-header"
            >
                <span v-if="title" class="me-auto text-truncate">{{ i18n.t(title) }}</span>
                <span v-else class="me-auto" />
                <button
                    class="btn btn-light btn-sm"
                    data-cy="window-close"
                    @click.stop="emit('close')"
                >
                    <FontAwesomeIcon icon="times" />
                </button>
            </div>
            <div class="card-body">
                <slot />
            </div>
        </div>
    </teleport>
</template>

<style lang="scss" scoped>
@import '@/scss/variables.module';
@import '@/scss/media-query.mixin';

.simple-window {
    $top-margin: 2 * $header-height + 2rem;
    z-index: $zindex-modal;
    position: fixed;
    top: $top-margin;
    right: 4rem;

    width: max-content;
    max-width: 100vw;

    max-height: calc(100vh - $top-margin);
    @include respond-below(phone) {
        $top-margin: $header-height;
        top: $top-margin;
        left: 50%;
        right: unset;
        transform: translate(-50%, 0%);
        max-height: calc(100vh - $top-margin);
    }
    .card-body {
        overflow-y: auto;
    }
}
</style>
