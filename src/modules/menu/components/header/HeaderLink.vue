<template>
    <button
        class="btn btn-xs btn-link m-0 px-1 custom-text-decoration"
        :class="{
            'text-black': !primary && !secondary,
            'text-primary': primary,
            'text-secondary': secondary,
        }"
        @click="forwardClickEvent"
    >
        <slot />
    </button>
</template>

<script>
/**
 * As we've many link like buttons in the header, this component aims at having the CSS required for
 * such link-button once
 */
export default {
    props: {
        primary: {
            type: Boolean,
            default: false,
        },
        secondary: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['click'],
    methods: {
        forwardClickEvent(e) {
            this.$emit('click', e)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.custom-text-decoration {
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
}
</style>
