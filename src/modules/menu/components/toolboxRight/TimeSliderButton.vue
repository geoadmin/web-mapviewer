<template>
    <button
        class="toolbox-button d-print-none mb-1"
        data-cy="time-slider-button"
        :class="{ active: active }"
        :title="active ? $t('time_hide') : $t('time_show')"
    >
        <font-awesome-icon size="lg" :icon="['fas', 'clock-rotate-left']" />
    </button>
</template>

<script>
export default {
    props: {
        active: {
            type: Boolean,
            default: false,
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/modules/menu/scss/toolbox-buttons';
</style>
