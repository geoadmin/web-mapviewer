<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

import debounce from '@/utils/debounce'
import log from '@/utils/logging'

const autoRotate = ref(false)
const store = useStore()

const handleOrientation = debounce((event) => {
    const rotation = (event.alpha / 180) * Math.PI
    log.debug('New device rotation value received', rotation)
    if (autoRotate.value) {
        store.dispatch('setRotation', rotation)
    }
}, 500)

function rotate() {
    autoRotate.value = !autoRotate.value
    if (autoRotate.value) {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission().then(() => {
                window.addEventListener('deviceorientation', handleOrientation, { passive: true })
            })
        } else {
            window.addEventListener('deviceorientation', handleOrientation, { passive: true })
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
    </div>
</template>
