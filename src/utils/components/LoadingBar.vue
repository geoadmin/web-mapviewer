<template>
    <div class="header-loading-bar">
        <div class="loading-bar-inner loading-bar-inner-1"></div>
        <div class="loading-bar-inner loading-bar-inner-2"></div>
    </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
$loading-element-width: 40rem;
$loading-bar-animation-duration: 2s;

.header-loading-bar {
    @import 'src/scss/variables';
    z-index: 1000; //Always on top of current stacking context
    box-sizing: content-box;
    height: 2px;
    position: absolute;
    top: 0;
    width: 100%;
    display: block;
    background-color: transparent;
    transform-origin: 100% 0;
    animation: loading-bar-animation $loading-bar-animation-duration
        cubic-bezier(0.645, 0.045, 0.355, 1) 0s infinite;
    .loading-bar-inner {
        position: absolute;
        top: 0;
        left: 0;
        bottom: auto;
        right: auto;
        width: 100%;
        height: 100%;
        background: $primary;
        transform-origin: 0 0;
    }
    .loading-bar-inner-1 {
        opacity: 0;
        animation: loading-bar-animation-inner-1 $loading-bar-animation-duration
            cubic-bezier(0.645, 0.045, 0.355, 1) 0s infinite;
    }
    .loading-bar-inner-2 {
        opacity: 1;
        animation: loading-bar-animation-inner-2 $loading-bar-animation-duration
            cubic-bezier(0.645, 0.045, 0.355, 1) 0s infinite;
    }
}

@keyframes loading-bar-animation {
    0% {
        transform: scaleX(1);
    }
    50% {
        transform: scaleX(1);
    }
    100% {
        transform: scaleX(0);
    }
}

@keyframes loading-bar-animation-inner-1 {
    0% {
        transform: scaleX(0);
    }
    25% {
        transform: scaleX(1);
    }
    100% {
        transform: scaleX(1);
    }
}

@keyframes loading-bar-animation-inner-2 {
    0% {
        transform: scaleX(0);
    }
    25% {
        transform: scaleX(0);
    }
    50% {
        transform: scaleX(1);
    }
    100% {
        transform: scaleX(1);
    }
}
</style>
