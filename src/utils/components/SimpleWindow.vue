<script setup>
import { computed, onMounted, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { useMovableElement } from '../composables/useMovableElement.composable'
import PrintButton from './PrintButton.vue'

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
    movable: {
        type: Boolean,
        default: false,
    },
    allowPrint: {
        type: Boolean,
        default: false,
    },
    initialPosition: {
        type: String,
        default: 'center',
    },
})
const { title, hide } = toRefs(props)

const store = useStore()

const showBody = ref(true)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)

const i18n = useI18n()

const emit = defineEmits(['close'])

const windowRef = ref(null)
const headerRef = ref(null)
const contentRef = ref(null)

const windowClass = computed(() => {
    switch (props.initialPosition) {
        case 'top-left':
            return 'position-top-left'
        case 'top-right':
            return 'position-top-right'
        case 'center':
        default:
            return 'position-center'
    }
})

onMounted(() => {
    if (props.movable) {
        const windowElement = windowRef.value
        const headerElement = headerRef.value
        useMovableElement(windowElement, {
            grabElement: headerElement,
        })
    }
})
</script>

<template>
    <teleport to="#main-component">
        <div
            v-show="!hide"
            ref="windowRef"
            class="simple-window card"
            :class="[windowClass, { 'dev-disclaimer-present': hasDevSiteWarning }]"
        >
            <div
                ref="headerRef"
                class="card-header d-flex align-items-center justify-content-sm-end"
                data-cy="window-header"
            >
                <span v-if="title" data-cy="simple-window-title" class="me-auto text-truncate">{{
                    i18n.t(title)
                }}</span>
                <span v-else class="me-auto" />
                <PrintButton v-if="allowPrint && showBody" :content="contentRef"></PrintButton>
                <button class="btn btn-light btn-sm me-2" @click.stop="showBody = !showBody">
                    <FontAwesomeIcon :icon="`caret-${showBody ? 'up' : 'down'}`" />
                </button>
                <button
                    class="btn btn-light btn-sm"
                    data-cy="window-close"
                    @click.stop="emit('close')"
                >
                    <FontAwesomeIcon icon="times" />
                </button>
            </div>
            <div ref="contentRef" class="card-body" :class="{ hide: !showBody }">
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
    z-index: calc($zindex-menu + 1);
    position: fixed;
    top: $top-margin;
    right: 4rem;
    width: max-content;
    max-width: 400px;
    max-height: calc(100vh - $top-margin);

    @include respond-below(phone) {
        $top-margin: $header-height;

        top: $top-margin;
        left: 50%;
        right: unset;
        transform: translate(-50%, 0%);
        max-height: calc(100vh - $top-margin);
        max-width: 100vw;

        &.dev-disclaimer-present {
            top: calc($top-margin + $dev-disclaimer-height);
        }
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
.position-top-left {
    left: calc($menu-tray-width + 2rem);
    right: unset;
}

.position-top-right {
    left: unset;
    right: 4rem;
}

.position-center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>
