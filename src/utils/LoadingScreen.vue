<template>
    <HeaderLoadingBar />
    <div class="loading-glass">
        <font-awesome-icon class="loading-glass-spinner" :icon="['fas', 'spinner']" spin />
    </div>
</template>

<script>
import HeaderLoadingBar from '@/modules/menu/components/header/HeaderLoadingBar.vue'
export default {
    components: {
        HeaderLoadingBar,
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
//@import 'src/scss/variables-admin';
.loading-glass {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 100vw;
    color: $black;
    background-color: rgba(255, 255, 255, 0.2);
    z-index: 1000;
    cursor: wait;
    text-align: center;
    line-height: 100vh;
}

.loading-glass-spinner {
    line-height: 1.5;
    display: inline-block;
    vertical-align: middle;
    font-size: min(40vh, 40vw);
    color: $secondary;
}

.fa-spin {
    animation-duration: 5s;
}

// system has hover support (mouse, trackpad, smart tv )
@media (hover: hover) {
    .loading-glass-spinner {
        opacity: 0;
    }
    .loading-glass {
        background-color: rgba(255, 255, 255, 0);
        // screen becomes a bit whiter if loading more than 5s
        animation: background-fade 5s forwards;
    }

    @keyframes background-fade {
        99.9% {
            background: rgba(255, 255, 255, 0);
        }
        100% {
            background: rgba(255, 255, 255, 0.3);
        }
    }
}
</style>
