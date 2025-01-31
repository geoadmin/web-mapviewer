<script setup>
/**
 * As we've many link like buttons in the header, this component aims at having the CSS required for
 * such link-button once
 */
import { toRefs } from 'vue'

const props = defineProps({
    primary: {
        type: Boolean,
        default: false,
    },
    secondary: {
        type: Boolean,
        default: false,
    },
    showAsButton: {
        type: Boolean,
        default: false,
    },
})
const { primary, secondary, showAsButton } = toRefs(props)

const emits = defineEmits(['click'])

function forwardClickEvent(e) {
    emits('click', e)
}
</script>

<template>
    <button
        class="btn m-0 px-1 custom-text-decoration"
        :class="{
            'btn-xs btn-link': !showAsButton,
            'btn-light border-light-subtle': showAsButton,
            'text-black': !primary && !secondary,
            'text-primary': primary,
            'text-secondary': secondary,
        }"
        @click="forwardClickEvent"
    >
        <slot />
    </button>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.custom-text-decoration {
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
}
</style>
