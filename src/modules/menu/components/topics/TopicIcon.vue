<template>
    <div class="topics-sprite" :class="`topics-sprite-${topicId}`"></div>
</template>
<style lang="scss">
@import '../../scss/topics-image';
</style>
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
