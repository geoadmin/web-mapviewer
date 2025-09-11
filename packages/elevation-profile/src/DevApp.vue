<script setup lang="ts">
import GeoadminElevationProfile from '@/GeoadminElevationProfile.vue'
</script>

<template>
    <GeoadminElevationProfile
        :locale="'de'"
        :title="'test'"
        :points="[
            [2651000.0, 1392000.0],
            [2932500.0, 894500.0],
        ]"
        :projection="'ESPG:2056'"
    />
</template>
