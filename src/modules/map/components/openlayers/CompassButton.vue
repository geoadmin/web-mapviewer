<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import log from '@/utils/logging'
import { round } from '@/utils/numberUtils'

const autoRotate = ref(false)
const store = useStore()
const currentRotation = computed(() => store.state.position.rotation)
const currentAutoRotate = computed(() => store.state.position.autoRotation)

const handleOrientation = function (event) {
    const rotation = round((event.alpha / 180) * Math.PI, 2)
    if (autoRotate.value && rotation !== currentRotation.value) {
        log.debug('New device rotation value received', rotation)
        store.dispatch('setRotation', rotation)
    }
}

function rotate() {
    autoRotate.value = !autoRotate.value
    store.dispatch('setAutoRotation', autoRotate.value)
    console.error(store.state.position.autoRotation)
    if (autoRotate.value) {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission().then(() => {
                window.addEventListener('deviceorientation', handleOrientation)
            })
        } else {
            window.addEventListener('deviceorientation', handleOrientation)
        }
    } else {
        window.removeEventListener('deviceorientation', handleOrientation)
    }
}
</script>

<template>
    <div>
        <button class="p-0" @click="rotate">
            {{ autoRotate ? 'AUTO-ROTATE ENABLED' : 'AUTO-ROTATE DISABLED' }}
        </button>
        <button>{{ currentAutoRotate }}</button>
    </div>
</template>
