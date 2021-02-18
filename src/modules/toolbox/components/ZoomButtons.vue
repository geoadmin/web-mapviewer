<template>
    <div class="zoom d-none d-md-block d-print-none">
        <a class="button zoom-in" data-cy="zoom-in" title="Zoom in" @click="increaseZoom()">
            <span class="icon zoom-in"></span>
        </a>
        <a class="button zoom-out" data-cy="zoom-out" title="Zoom out" @click="decreaseZoom()">
            <span class="icon zoom-out"></span>
        </a>
    </div>
</template>

<style lang="scss">
.button {
    display: block;
    height: 40px;
    width: 40px;
    background-color: rgba(0, 0, 0, 0.6);
    &:hover {
        background-color: #333;
    }
    .icon {
        margin: 10px;
    }
}
.zoom-in {
    margin-bottom: 2px;
    border-radius: 4px;
}
.zoom-out {
    margin-bottom: 0;
    border-radius: 4px;
}
.icon {
    display: inline-block;
    vertical-align: top;
    width: 20px;
    height: 20px;
    background-image: url(../assets/zoom_sprite.png);
    &.zoom-in {
        background-position: 0 0;
    }
    &.zoom-out {
        background-position: 20px 0;
    }
}
</style>

<script>
import { mapActions } from 'vuex'

export default {
    methods: {
        ...mapActions(['increaseZoom', 'decreaseZoom']),
    },
}
</script>
