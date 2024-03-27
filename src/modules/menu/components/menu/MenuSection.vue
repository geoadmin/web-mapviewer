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
                ref="sectionBody"
                class="menu-section-body"
                data-cy="menu-section-body"
            >
                <slot />
            </div>
        </CollapseTransition>
    </div>
</template>

<script>
// importing directly the vue component, see https://github.com/ivanvermeyen/vue-collapse-transition/issues/5
import CollapseTransition from '@ivanv/vue-collapse-transition/src/CollapseTransition.vue'

export default {
    components: {
        CollapseTransition,
    },
    props: {
        // String that uniquely identifies this section
        id: {
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
    },
    expose: ['close', 'open'],
    emits: ['openMenuSection', 'closeMenuSection', 'click:header'],
    data() {
        return {
            showBody: this.showContent,
        }
    },
    computed: {
        titleCaretIcon() {
            if (this.showBody) {
                return 'caret-down'
            }
            return 'caret-right'
        },
    },
    watch: {
        showContent(showContent) {
            this.setShowBody(showContent)
        },
    },
    methods: {
        toggleShowBody() {
            if (this.disabled) {
                return
            }

            this.setShowBody(!this.showBody)
            this.$emit('click:header')
        },
        setShowBody(value) {
            if (this.showBody !== value) {
                this.showBody = value
                if (this.showBody) {
                    this.$emit('openMenuSection', this.id)
                } else {
                    this.$emit('closeMenuSection', this.id)
                }
            }
        },
        open() {
            this.setShowBody(true)
        },
        close() {
            this.setShowBody(false)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

$section-border: 1px;

.menu-section-header {
    display: flex;
    flex: none;
    overflow: visible;
    padding: 0.5rem 0.6rem;
    line-height: 1.5;
    border-top: $section-border solid $gray-400;
    background-color: $light;
    cursor: pointer;
    .menu-section-secondary & {
        color: $white;
        background-color: $secondary;
        border-color: $gray-400;
    }
    .menu-section-light & {
        color: $black;
        background-color: $gray-200;
        border-color: $gray-400;
    }

    .menu-section-open & {
        border-bottom: $section-border solid $gray-400;
        background-color: $gray-200;
    }

    &.disabled {
        cursor: not-allowed;
        user-select: none;
    }
}
.menu-section-title {
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

.menu-section-body {
    background-color: $white;
    overflow: auto;
    flex: initial;
}

.menu-section {
    overflow: hidden;
    display: flex; // so that the scrollable section can take the full space except for the header.
    flex-direction: column;
    border: 0;
}

.menu-section-open {
    background-color: $white;
}
</style>
