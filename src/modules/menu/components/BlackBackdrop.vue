<template>
    <div class="app-backdrop" data-cy="black-backdrop"></div>
</template>

<script></script>

<style lang="scss" scoped>
@import 'src/scss/variables';

.app-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1000; //Display behind the current stacking context
}
</style>
