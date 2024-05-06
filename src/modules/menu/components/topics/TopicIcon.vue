<template>
    <div class="topics-sprite" :class="`topics-sprite-${topicId}`"></div>
</template>

<script>
/**
 * Component to show the icon (from the sprite in the assets) for each topic. (S)CSS rules are
 * stored in a separate file, see the import
 */
export default {
    props: {
        topicId: {
            type: String,
            default: 'ech',
        },
    },
}
</script>

<style lang="scss" scoped>
@import '@/modules/menu/scss/topics-image';
</style>
