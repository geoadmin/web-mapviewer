<script setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

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
    /** Add a minimize button in header that will hide/show the body */
    hasMinimize: {
        type: Boolean,
        default: true,
    },
})
const { title, hide } = toRefs(props)

const store = useStore()

const showBody = ref(true)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)

const i18n = useI18n()

const emit = defineEmits(['close'])
</script>

<template>
    <teleport to="#main-component">
        <div
            v-show="!hide"
            class="simple-window card bg-danger text-white fw-bold"
            :class="{ 'dev-disclaimer-present': hasDevSiteWarning }"
            data-cy="error-window"
        >
            <div
                class="card-header d-flex align-items-center justify-content-sm-end"
                data-cy="window-header"
            >
                <span v-if="title" class="me-auto text-truncate">{{ i18n.t(title) }}</span>
                <span v-else class="me-auto" />
                <button
                    class="btn btn-light btn-sm btn-outline-danger me-2"
                    @click.stop="showBody = !showBody"
                >
                    <FontAwesomeIcon :icon="`caret-${showBody ? 'down' : 'right'}`" />
                </button>
                <button
                    class="btn btn-light btn-sm btn-outline-danger"
                    data-cy="error-window-close"
                    @click.stop="emit('close')"
                >
                    <FontAwesomeIcon icon="times" />
                </button>
            </div>
            <div class="card-body" :class="{ hide: !showBody }" data-cy="error-window-body">
                <slot />
            </div>
        </div>
    </teleport>
</template>

<style lang="scss" scoped>
@import '@/scss/variables.module';
@import '@/scss/media-query.mixin';

.simple-window {
    $top-margin: calc(2 * $header-height + 2rem);
    z-index: calc($zindex-menu - 1);
    position: fixed;
    top: $top-margin;
    right: 4rem;

    width: max-content;
    max-width: 400px;

    max-height: calc(100vh - $top-margin);
    @include respond-below(phone) {
        $top-margin: $header-height;
        &.dev-disclaimer-present {
            $top-margin: calc($header-height + $dev-disclaimer-height);
        }

        top: $top-margin;
        left: 50%;
        right: unset;
        transform: translate(-50%, 0%);
        max-height: calc(100vh - $top-margin);
        max-width: 100vw;
    }
    .card-body {
        overflow-y: auto;

        &.hide {
            visibility: hidden;
            height: 0px;
            padding: 0px;
        }
    }
}
</style>
