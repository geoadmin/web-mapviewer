<template>
    <div
        class="menu-section"
        :class="{
            'menu-section-secondary': secondary && !showBody,
            'menu-section-open': showBody,
        }"
    >
        <div
            class="menu-section-header"
            data-cy="menu-section-header"
            data-toggle="collapse"
            @click="toggleShowBody"

        >
            <span class="menu-section-title">
                <button class="btn menu-section-title-icon" type="button">
                    <font-awesome-icon :icon="['fas', titleCaretIcon]" />
                </button>
                <span class="menu-section-title-text">{{ title }}</span>
            </span>

            <slot name="extra-button" />
        </div>
        <CollapseTransition :duration="200">
            <div v-show="showBody" ref="sectionBody" class="menu-section-body">
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
        title: {
            type: String,
            required: true,
        },
        showContent: {
            type: Boolean,
            default: false,
        },
        alwaysKeepClosed: {
            type: Boolean,
            default: false,
        },
        secondary: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['showBody', 'click:header'],
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
        computedBodyHeight() {
            return this.$refs.sectionBody && this.$refs.sectionBody.clientHeight
        },
    },
    watch: {
        showContent(showContent) {
            this.showBody = showContent
        },
    },
    methods: {
        toggleShowBody() {
            if (!this.alwaysKeepClosed) {
                this.showBody = !this.showBody
            }
            if (this.showBody) {
                this.$emit('showBody')
            }
            this.$emit('click:header')
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.menu-section {
    border: 0;
}
.menu-section-header {
    display: flex;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid $gray-400;
    background-color: $light;
    cursor: pointer;
    .menu-section-secondary & {
        color: $white;
        background-color: $secondary;
        border-color: $gray-400;
    }
    .menu-section-open & {
        background-color: $white;
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
        padding: 0 0.5rem;
        .menu-section-open & {
            font-weight: bold;
        }
    }
}
.menu-section-body {
    padding: 0;
    background-color: $white;
}
</style>
