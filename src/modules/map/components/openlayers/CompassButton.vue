<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useStore } from 'vuex'

const autoRotate = ref(false)
const store = useStore()

onMounted(() => {
    window.addEventListener('deviceorientation', handleOrientation)
})
onUnmounted(() => {
    window.removeEventListener('deviceorientation', handleOrientation)
})

function handleOrientation(event) {
    console.error(autoRotate.value, event.alpha, (event.alpha / 180) * Math.PI)
    if (autoRotate.value) {
        store.dispatch('setRotation', (event.alpha / 180) * Math.PI)
    }
}

function rotate() {
    autoRotate.value = !autoRotate.value
}
</script>

<template>
    <div>
        <button class="p-0" @click="rotate">
            {{ autoRotate ? 'AUTO-ROTATE ENABLED' : 'AUTO-ROTATE DISABLED' }}
        </button>
    </div>
</template>
