<script setup>
import { inject, onMounted, onUnmounted, ref } from 'vue'
import { useStore } from 'vuex'

const dispatcher = { dispatcher: 'OpenLayersCompassButton.vue' }

const olMap = inject('olMap')
const store = useStore()

const rotation = ref(0)

onMounted(() => {
    olMap.on('postrender', onRotate)
})

onUnmounted(() => {
    olMap.un('postrender', onRotate)
})

function resetRotation() {
    store.dispatch('setAutoRotation', { autoRotation: false, ...dispatcher })
    store.dispatch('setRotation', { rotation: 0, ...dispatcher })
}

const onRotate = (mapEvent) => {
    const newRotation = mapEvent.frameState.viewState.rotation
    if (newRotation !== rotation.value) {
        rotation.value = newRotation
    }
}
</script>

<template>
    <!-- The rotation constraint of the openlayers view by default snaps to zero. This means that
    even if the angle is not normalized, it will automatically be set to zero if pointing to the
    north -->
    <button
        v-if="Math.abs(rotation) >= 1e-9"
        class="toolbox-button d-print-none"
        data-cy="compass-button"
        type="button"
        :title="$t('rotate_reset')"
        @click="resetRotation"
    >
        <!-- SVG icon adapted from "https://www.svgrepo.com/svg/883/compass" (and greatly
            simplified the code). Original icon was liscensed under the CCO liscense. -->
        <svg
            class="compass-button-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-100 -240 200 480"
            :style="{ transform: `rotate(${rotation}rad)` }"
        >
            <polygon style="fill: #cd2a00" points="-100,0 100,0 0,240" />
            <polygon style="fill: #ff3501" points="-100,0 100,0 0,-240" />
        </svg>
    </button>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
.compass-button {
    &-icon {
        height: $map-button-diameter - 5px;
    }
}
</style>
