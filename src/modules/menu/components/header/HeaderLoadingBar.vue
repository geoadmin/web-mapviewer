<template>
    <div class="header-loading-bar"></div>
</template>

<script>
export default {}
</script>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
@import 'src/scss/variables';
$loading_element_width: 40rem;

.header-loading-bar {
    box-sizing: content-box;
    height: $header-loading-bar-height;
    position: relative;
    width: 100%;
    display: block;
    background-color: $red;
    background-size: $loading_element_width $loading_element_width;
    background-image: linear-gradient(
        -45deg,
        rgba(255, 255, 255, 0.2) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.2) 50%,
        rgba(255, 255, 255, 0.2) 75%,
        transparent 75%,
        transparent
    );
    animation: move 2s linear infinite;
}
@keyframes move {
    0% {
        background-position: 0 0;
    }
    100% {
        background-position: $loading_element_width $loading_element_width;
    }
}
</style>
