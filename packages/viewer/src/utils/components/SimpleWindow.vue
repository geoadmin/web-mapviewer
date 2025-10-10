<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import useUiStore from '@/store/modules/ui.store'
import PrintButton from '@/utils/components/PrintButton.vue'
import { useMovableElement } from '@/utils/composables/useMovableElement.composable'

const acceptedInitialPositions = ['top-left', 'top-center', 'top-right', 'bottom-center'] as const
type InitialPosition = (typeof acceptedInitialPositions)[number]

interface Props {
    title?: string
    /** Hide the modal with backdrop, can be used to temporarily hide the modal without loosing its content */
    hide?: boolean
    movable?: boolean
    resizeable?: boolean
    allowPrint?: boolean
    initialPosition?: string
    /** If true, the window will be displayed in 80% of the screen width, else it will be displayed in compact mode (400px) */
    wide?: boolean
    small?: boolean
    dataCy?: string
}

const props = withDefaults(defineProps<Props>(), {
    title: '',
    hide: false,
    movable: false,
    resizeable: false,
    allowPrint: false,
    initialPosition: 'top-center',
    wide: false,
    small: false,
    dataCy: 'simple-window',
})

const uiStore = useUiStore()

const showBody = ref(true)
const hasDevSiteWarning = computed(() => uiStore.hasDevSiteWarning)

const { t } = useI18n()

const emit = defineEmits<{
    close: []
}>()

const windowRef = useTemplateRef<HTMLDivElement>('windowRef')
const headerRef = useTemplateRef<HTMLDivElement>('headerRef')
const contentRef = useTemplateRef<HTMLDivElement>('contentRef')

const initialPositionClass = computed(() => {
    if (acceptedInitialPositions.includes(props.initialPosition as InitialPosition)) {
        return props.initialPosition
    } else {
        return 'top-center'
    }
})

onMounted(() => {
    if (props.movable) {
        const windowElement = windowRef.value
        const headerElement = headerRef.value
        if (windowElement && headerElement) {
            useMovableElement({
                element: windowElement,
                grabElement: headerElement,
                initialPositionClasses: [initialPositionClass.value],
                offset: { bottom: 0, right: 0, left: 0 },
            })
        }
    }
})
</script>

<template>
    <teleport to="#main-component">
        <div
            v-show="!hide"
            ref="windowRef"
            class="simple-window card"
            :data-cy="dataCy"
            :class="[
                initialPositionClass,
                {
                    'dev-disclaimer-present': hasDevSiteWarning,
                    wide: wide,
                    small: small,
                    resizable: resizeable && showBody,
                },
            ]"
        >
            <div
                ref="headerRef"
                class="card-header d-flex align-items-center justify-content-sm-end"
                data-cy="window-header"
            >
                <span
                    v-if="title"
                    data-cy="simple-window-title"
                    class="text-truncate me-auto"
                >
                    {{ t(title) }}
                </span>
                <span
                    v-else
                    class="me-auto"
                />
                <PrintButton
                    v-if="allowPrint && showBody"
                    :content="contentRef ?? undefined"
                />
                <button
                    class="btn btn-light btn-sm me-2"
                    data-cy="simple-window-minimize"
                    @click.stop="showBody = !showBody"
                >
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
            <div
                ref="contentRef"
                class="card-body"
                :class="{ hide: !showBody }"
                data-cy="simple-window-body"
            >
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

    touch-action: none; //to mitigate ios overscroll bouncing
    overscroll-behavior: contain;

    .card-body {
        // Limiting height so that it doesn't grow too large on browser with zoom enabled.
        // Tested this value with my browser at 200%, and it still only covered the map (no spill over on the header)
        max-height: 66vh;
        overflow-y: auto;

        &.hide {
            visibility: hidden;
            height: 0;
            padding: 0;
        }
    }

    & {
        z-index: calc($zindex-menu + 1);
        top: $top-margin;
        right: 4rem;
        width: max-content;
        position: fixed;
        max-width: 400px;
        max-height: max-content;
    }

    @include respond-above(phone) {
        &.resizable {
            min-width: min-content;
            width: min-content;
            height: min(500px, calc(100vh - $top-margin));
            max-width: max-content;
            resize: both;
            overflow: auto;
        }

        &.wide {
            max-width: calc(100vw - $menu-tray-width - 2rem);
            min-width: 50vw;
        }

        &.top-left {
            left: calc($menu-tray-width + 2rem);
            right: unset;
        }

        &.top-right {
            left: unset;
            right: 4rem;
        }

        &.top-center {
            top: $card-spacer-y !important;
            left: 50%;
            transform: translate(-50%, 0);
        }

        &.bottom-center {
            top: unset !important;
            bottom: $card-spacer-y !important;
            left: 50%;
            transform: translate(-50%, 0);
        }
    }

    @include respond-below(phone) {
        $top-margin: $header-height;

        top: $top-margin;
        left: 0;
        right: 0;
        transform: unset;
        max-height: calc(100vh - $top-margin);
        max-width: 100vw;
        width: 100vw;

        &.small {
            left: 10px;
            right: 10px;
            max-width: 75vw;
            width: 75vw;
        }

        &.dev-disclaimer-present {
            top: calc($top-margin + $dev-disclaimer-height);
        }
    }
}
</style>
