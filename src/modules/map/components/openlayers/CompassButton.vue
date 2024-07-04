<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const autoRotation = computed(() => store.state.position.autoRotation)

function rotate() {
    store.dispatch('setAutoRotation', !autoRotation.value)
}
</script>

<template>
    <div>
        <button class="toolbox-button" @click="rotate">
            <FontAwesomeIcon :icon="autoRotation ? 'far fa-trash-alt' : 'arrow-up'" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
</style>
