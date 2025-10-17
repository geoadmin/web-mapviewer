<script setup lang="ts">
/**
 * As we've many link like buttons in the header, this component aims at having the CSS required for
 * such link-button once
 */

const {
    primary = false,
    secondary = false,
    showAsButton = false,
    dataCy = '',
} = defineProps<{
    primary?: boolean
    secondary?: boolean
    showAsButton?: boolean
    dataCy?: string
}>()

const emits = defineEmits<{
    click: [event: MouseEvent]
}>()

function forwardClickEvent(e: MouseEvent) {
    emits('click', e)
}
</script>

<template>
    <button
        class="btn custom-text-decoration m-0 px-1"
        :class="{
            'btn-xs btn-link': !showAsButton,
            'btn-light border-light-subtle': showAsButton,
            'text-black': !primary && !secondary,
            'text-primary': primary,
            'text-secondary': secondary,
        }"
        :data-cy="dataCy"
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
