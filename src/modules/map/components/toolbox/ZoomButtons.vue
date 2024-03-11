<script setup>
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const dispatcher = { dispatcher: 'ZoomButtons.vue' }

const store = useStore()
const i18n = useI18n()

function increaseZoom() {
    store.dispatch('increaseZoom', dispatcher)
}
function decreaseZoom() {
    store.dispatch('decreaseZoom', dispatcher)
}
</script>

<template>
    <button
        class="toolbox-button d-print-none"
        data-cy="zoom-in"
        :title="i18n.t('zoom_in')"
        @click="increaseZoom"
    >
        <font-awesome-icon size="lg" :icon="['fas', 'plus-circle']" />
    </button>
    <button
        class="toolbox-button d-print-none"
        data-cy="zoom-out"
        :title="i18n.t('zoom_out')"
        @click="decreaseZoom"
    >
        <font-awesome-icon size="lg" :icon="['fas', 'minus-circle']" />
    </button>
</template>

<style lang="scss" scoped>
@import 'src/modules/map/scss/toolbox-buttons';
</style>
