<script setup lang="ts">
const {
    sourceId,
    sourceName,
    sourceUrl,
    hasDataDisclaimer = false,
    isLast = false,
} = defineProps<{
    sourceId: string
    sourceName: string
    sourceUrl?: string
    hasDataDisclaimer?: boolean
    isLast?: boolean
}>()
</script>

<template>
    <component
        :is="sourceUrl ? 'a' : 'span'"
        :id="`source-${sourceId}`"
        :href="sourceUrl"
        :target="sourceUrl ? '_blank' : null"
        class="map-footer-attribution-source clear-no-ios-long-press"
        :class="{ 'text-primary': hasDataDisclaimer, 'is-link': sourceUrl || hasDataDisclaimer }"
        :data-cy="`layer-copyright-${sourceName}`"
    >
        {{ `${sourceName}${isLast ? '' : ','}` }}
    </component>
</template>

<style lang="scss" scoped>
@import '@swissgeo/theme/scss/geoadmin-theme';

.map-footer-attribution-source {
    margin-left: 2px;
    color: $black;

    &.is-link {
        text-decoration: none;
        &:hover {
            text-decoration: underline;
            cursor: pointer;
        }
    }
}
</style>
