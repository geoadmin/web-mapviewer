<template>
    <transition name="fade">
        <div
            v-show="showOverlay"
            id="overlay"
            :class="{ front: shouldBeFront }"
            data-cy="overlay"
            @click="hideOverlay"
        />
    </transition>
</template>

<style lang="scss">
@import 'src/scss/variables';
#overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: $zindex-overlay-default;
    &.front {
        z-index: $zindex-overlay-front;
    }
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>

<script>
import { mapState, mapActions } from 'vuex'

export default {
    computed: {
        ...mapState({
            showOverlay: (state) => state.overlay.show,
            shouldBeFront: (state) => state.overlay.shouldBeFront,
        }),
    },
    methods: {
        ...mapActions(['hideOverlay']),
    },
}
</script>
