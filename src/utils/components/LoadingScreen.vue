<template>
    <!-- To be sure it is always on the main stacking context so that it can be on top of everything
    else -->
    <teleport to="#main-component">
        <LoadingBar />
        <div class="loading-glass">
            <font-awesome-icon class="loading-glass-spinner" :icon="['fas', 'spinner']" spin />
        </div>
    </teleport>
</template>

<script>
import LoadingBar from '@/utils/components/LoadingBar.vue'

export default {
    components: {
        LoadingBar,
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.loading-glass {
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    color: $black;
    background-color: rgba(255, 255, 255, 0.2);
    z-index: $zindex-loading-screen;
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
        // screen becomes a bit whiter if loading more than 2s
        animation: background-fade 2s forwards;
    }

    @keyframes background-fade {
        99% {
            background: rgba(255, 255, 255, 0);
        }
        100% {
            background: rgba(255, 255, 255, 0.3);
        }
    }
}
</style>
