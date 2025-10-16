<script setup lang="ts">
/**
 * Component to show the icon (from the sprite in the assets) for each topic. (S)CSS rules are
 * stored in a separate file, see the import
 */

const { topicId = 'ech' } = defineProps<{
    topicId?: string
}>()
</script>

<template>
    <div
        class="topics-sprite"
        :class="`topics-sprite-${topicId}`"
    />
</template>

<style lang="scss" scoped>
@import '@/modules/menu/scss/topics-image';
</style>
