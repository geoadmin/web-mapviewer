<template>
    <!-- eslint-disable vue/no-v-html-->
    <div
        v-for="(feature, index) in highlightedFeatures"
        :key="`${feature.layer.id}-${feature.id ? feature.id : index}`"
        class="tooltip-feature"
        data-cy="highlighted-features"
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

<style lang="scss">
.htmlpopup-container {
    width: 100%;
    font-size: 11px;
    text-align: start;
}
.htmlpopup-header {
    background-color: #e9e9e9;
    padding: 7px;
    margin-bottom: 7px;
    font-weight: 700;
}
.htmlpopup-content table {
    width: 100%;
    border: 0;
    margin: 0 7px;
}
</style>
