<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const layoutName = computed(() => {
    return store.state.print.selectedLayout.name
})

const scale = computed(() => {
    return store.state.print.selectedScale
})
</script>

<template>
    <div class="d-flex align-items-center justify-content-center vh-100">
        <div class="text-center">
            <h1>Layout: {{ layoutName }}; Scale: {{ scale }}</h1>
        </div>
    </div>
</template>
