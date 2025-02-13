<script setup>
// importing directly the vue component, see https://github.com/ivanvermeyen/vue-collapse-transition/issues/5
import CollapseTransition from '@ivanv/vue-collapse-transition/src/CollapseTransition.vue'
import { computed, ref, watch } from 'vue'

const { sectionId, title, showContent, secondary, light, disabled } = defineProps({
    // String that uniquely identifies this section
    sectionId: {
        type: String,
        required: true,
    },
    // Translated name of this section
    title: {
        type: String,
        required: true,
    },
    showContent: {
        type: Boolean,
        default: false,
    },
    secondary: {
        type: Boolean,
        default: false,
    },
    light: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
})

const emits = defineEmits(['openMenuSection', 'closeMenuSection', 'click:header'])

const showBody = ref(showContent)

const titleCaretIcon = computed(() => `caret-${showBody.value ? 'down' : 'right'}`)

watch(
    () => showContent,
    () => {
        setShowBody(showContent)
    }
)

function toggleShowBody() {
    if (disabled) {
        return
    }
    setShowBody(!showBody.value)
    emits('click:header')
}

function setShowBody(value) {
    if (showBody.value !== value) {
        showBody.value = value
        if (showBody.value) {
            emits('openMenuSection', sectionId)
        } else {
            emits('closeMenuSection', sectionId)
        }
    }
}

function open() {
    setShowBody(true)
}

function close() {
    setShowBody(false)
}

defineExpose({ open, close, sectionId })
</script>

<template>
    <div
        class="menu-section"
        :class="{
            'menu-section-secondary': secondary && !showBody,
            'menu-section-light': light && !showBody,
            'menu-section-open': showBody,
        }"
    >
        <div
            class="menu-section-header"
            :class="{
                disabled: disabled,
            }"
            data-cy="menu-section-header"
            data-toggle="collapse"
            @click="toggleShowBody"
        >
            <span class="menu-section-title d-flex align-items-center">
                <button
                    class="btn border-0 menu-section-title-icon"
                    type="button"
                    :disabled="disabled"
                >
                    <font-awesome-icon :icon="['fas', titleCaretIcon]" />
                </button>
                <span class="ms-2 menu-section-title-text">{{ title }}</span>
            </span>

            <slot name="extra-button" />
        </div>
        <CollapseTransition :duration="200">
            <div
                v-show="showBody"
                class="menu-section-body"
                data-cy="menu-section-body"
            >
                <slot />
            </div>
        </CollapseTransition>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
@import '@/scss/webmapviewer-bootstrap-theme';

$section-border: 1px;

.menu-section {
    display: flex; // so that the scrollable section can take the full space except for the header.
    flex-direction: column;
    border: 0;

    &-header {
        display: flex;
        flex: none;
        overflow: visible;
        padding: 0.5rem 0.6rem;
        line-height: 1.5;
        border-top: $section-border solid $gray-400;
        background-color: $light;
        cursor: pointer;

        &.disabled {
            cursor: not-allowed;
            user-select: none;
        }
    }

    &-secondary &-header {
        color: $white;
        background-color: $secondary;
        border-color: $gray-400;
    }
    &-light &-header {
        color: $black;
        background-color: $gray-200;
        border-color: $gray-400;
    }

    &-open {
        background-color: $white;
    }
    &-open &-header {
        border-bottom: $section-border solid $gray-400;
        background-color: $gray-200;
    }

    &-title {
        flex-grow: 1;
        text-align: left;
        &-icon {
            width: 0.8rem;
            text-align: center;
            line-height: 1;
            display: block;
            float: left;
            padding: 0;
            color: inherit;
        }
        &-text {
            .menu-section-open & {
                font-weight: bold;
            }
        }
    }

    &-body {
        background-color: $white;
        overflow: auto;
        max-width: 100vw;
        flex: initial;
    }
}

@include respond-above(phone) {
    .menu-section {
        overflow: hidden;
    }
}
</style>
