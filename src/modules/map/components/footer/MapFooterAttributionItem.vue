<template>
    <component
        :is="sourceUrl ? 'a' : 'span'"
        :id="`source-${sourceId}`"
        :href="sourceUrl"
        :target="sourceUrl ? '_blank' : null"
        class="map-footer-attribution-source"
        :class="{ 'text-primary': hasDataDisclaimer }"
        :data-cy="`layer-copyright-${sourceName}`"
    >
        {{ `${sourceName}${isLast ? '' : ','}` }}
    </component>
</template>

<script>
export default {
    props: {
        sourceId: {
            type: String,
            required: true,
        },
        sourceName: {
            type: String,
            required: true,
        },
        sourceUrl: {
            type: String,
            default: null,
        },
        hasDataDisclaimer: {
            type: Boolean,
            default: false,
        },
        isLast: {
            type: Boolean,
            default: false,
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.map-footer-attribution-source {
    margin-left: 2px;
    color: $black;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
        cursor: pointer;
    }
}
</style>
