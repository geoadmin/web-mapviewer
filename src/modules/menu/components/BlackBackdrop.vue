<template>
    <div class="app-backdrop" :class="{ front }" data-cy="black-backdrop"></div>
</template>

<script>
export default {
    props: {
        front: {
            type: Boolean,
            default: false,
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/variables';

.app-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: $zindex-backdrop-default;
    &.front {
        z-index: $zindex-backdrop-front;
    }
}
</style>
