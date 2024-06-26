<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

import debounce from '@/utils/debounce.js'

const autoRotate = ref(false)
const store = useStore()

function handleOrientation(event) {
    debounce(() => {
        console.error(autoRotate.value, event.alpha, (event.alpha / 180) * Math.PI)
        if (autoRotate.value) {
            store.dispatch('setRotation', (event.alpha / 180) * Math.PI)
        }
    }, 500)
}

function rotate() {
    autoRotate.value = !autoRotate.value
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
    </div>
</template>
