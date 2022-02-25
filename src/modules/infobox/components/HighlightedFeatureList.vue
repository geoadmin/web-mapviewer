<template>
    <!-- eslint-disable vue/no-v-html-->
    <div
        v-for="(feature, index) in highlightedFeatures"
        :key="`${feature.layer.id}-${feature.id ? feature.id : index}`"
        class="tooltip-feature"
        v-html="feature.htmlPopup"
    />
    <!-- eslint-enable vue/no-v-html-->
</template>
<script>
export default {
    props: {
        /**
         * List of highlighted feature
         *
         * @type {Feature[]}
         */
        highlightedFeatures: {
            type: Array,
            required: true,
        },
    },
}
</script>
