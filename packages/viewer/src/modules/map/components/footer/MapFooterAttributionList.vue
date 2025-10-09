<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
    attributions: Array<{ label: string; url: string }>
}>()
</script>

<template>
    <div class="map-footer-attribution-list">
        <MapFooterAttributionItem
            v-for="(attribution, index) in attributions"
            :key="index"
            :label="attribution.label"
            :url="attribution.url"
        />
    </div>
</template>

<style lang="scss" scoped>
.map-footer-attribution-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
}
</style>
