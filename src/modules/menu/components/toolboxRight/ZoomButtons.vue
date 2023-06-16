<template>
    <button
        class="toolbox-button d-print-none"
        data-cy="zoom-in"
        :title="$t('zoom_in')"
        @click="onZoomIn"
    >
        <font-awesome-icon size="lg" :icon="['fas', 'plus-circle']" />
    </button>
    <button
        class="toolbox-button d-print-none"
        data-cy="zoom-out"
        :title="$t('zoom_out')"
        @click="onZoomOut"
    >
        <font-awesome-icon size="lg" :icon="['fas', 'minus-circle']" />
    </button>
</template>

<script>
export default {
    emits: ['zoom-in', 'zoom-out'],
    methods: {
        onZoomIn() {
            this.$emit('zoom-in')
        },
        onZoomOut() {
            this.$emit('zoom-out')
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/modules/menu/scss/toolbox-buttons';
</style>
