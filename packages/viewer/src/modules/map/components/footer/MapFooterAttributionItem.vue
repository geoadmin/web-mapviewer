<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
    label: string
    url: string
}>()
</script>

<template>
    <a
        class="map-footer-attribution-item"
        :href="url"
        target="_blank"
    >
        {{ label }}
    </a>
</template>

<style lang="scss" scoped>
.map-footer-attribution-item {
    color: inherit;
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
}
</style>
