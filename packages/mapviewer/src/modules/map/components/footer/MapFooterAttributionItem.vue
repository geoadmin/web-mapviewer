<script setup>
const { sourceId, sourceName, sourceUrl, hasDataDisclaimer, isLast, isTruncated } = defineProps({
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
    isTruncated: {
        type: Boolean,
        default: false,
    },
})
</script>

<template>
    <component
        :is="sourceUrl ? 'a' : 'span'"
        :id="`source-${sourceId}`"
        :href="sourceUrl"
        :target="sourceUrl ? '_blank' : null"
        :rel="sourceUrl ? 'noopener noreferrer' : null"
        class="map-footer-attribution-source clear-no-ios-long-press"
        :class="{
            'text-primary': hasDataDisclaimer,
            'is-link': sourceUrl || hasDataDisclaimer,
            'is-truncated': isTruncated,
        }"
        :data-cy="`layer-copyright-${sourceName}`"
        :title="sourceName"
    >
        {{ `${sourceName}${isLast ? '' : ','}` }}
    </component>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.map-footer-attribution-source {
    margin-left: 2px;
    color: $black;

    &.is-truncated {
        display: inline-block;
        max-width: min(16rem, 28vw);
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: bottom;
        white-space: nowrap;
    }

    &.is-link {
        text-decoration: none;
        &:hover {
            text-decoration: underline;
            cursor: pointer;
        }
    }
}
</style>
