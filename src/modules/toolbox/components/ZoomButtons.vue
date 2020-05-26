<template>
    <div class="zoom">
        <a class="button zoomin" data-cy="zoom-in" title="Zoom in" @click="increaseZoom()">
            <span class="icon zoomin"></span>
        </a>
        <a class="button zoomout" data-cy="zoom-out" title="Zoom out" @click="decreaseZoom()">
            <span class="icon zoomout"></span>
        </a>
    </div>
</template>

<style>
    .zoom {
        position: absolute;
        right: 10px;
        bottom: 10px;
    }

    .zoom .button {
        display: block;
        height: 40px;
        width: 40px;
        background-color: rgba(0, 0, 0, 0.6);
    }

    .button:hover {
        background-color: #333
    }

    .zoomin {
        margin-bottom: 2px;
        border-radius: 4px;
    }

    .zoomout {
        margin-bottom: 0;
        border-radius: 4px;
    }

    .icon {
        display: inline-block;
        vertical-align: top;
        width: 20px;
        height: 20px;
        background-image: url(/img/icons/zoom_sprite.png);
    }

    .button .icon {
        margin: 10px;
    }

    .icon.zoomin {
        background-position: 0px 0;
    }

    .icon.zoomout {
        background-position: 20px 0;
    }
</style>

<script>
    import {mapActions} from "vuex";

    export default {
        methods: {
            ...mapActions(['increaseZoom', 'decreaseZoom'])
        }
    };
</script>
