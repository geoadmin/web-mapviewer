<template>
    <div class="search-category">
        <div class="search-category-header p-2">
            {{ title }}
        </div>
        <ul class="search-category-body">
            <slot />
        </ul>
    </div>
</template>

<script>
import LayerLegendPopup from '@/modules/menu/components/LayerLegendPopup.vue'
import SearchResultListEntry from './SearchResultListEntry.vue'

/**
 * Search results from the backend are sorted in two categories : layers and locations, this
 * component is there to show one of those category at a time
 */
export default {
    props: {
        title: {
            type: String,
            required: true,
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.search-category {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    &-header {
        flex: none;
        overflow: visible;
        font-size: 0.825rem;
        font-weight: bold;
        background-color: $input-group-addon-bg;
    }
    &-body {
        flex: initial;
        margin: 0;
        padding: 0;
        list-style: none;
        overflow: auto;
        font-size: 0.8rem;
    }
}
</style>
