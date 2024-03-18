<script setup>
import { computed, toRefs } from 'vue'
import { useStore } from 'vuex'

import FeatureDetail from '@/modules/infobox/components/FeatureDetail.vue'

const dispatcher = { dispatcher: 'FeatureList.vue' }

const props = defineProps({
    direction: {
        type: String,
        default: 'row',
        validator: (value) => ['row', 'column'].includes(value),
    },
})
const { direction } = toRefs(props)

const store = useStore()
const features = computed(() =>
    store.state.features.selectedFeatures.filter((feature) => !feature.isEditable)
)

function highlightFeature(feature) {
    store.dispatch('setHighlightedFeatureId', {
        highlightedFeatureId: feature?.id,
        ...dispatcher,
    })
}
function clearHighlightedFeature() {
    store.dispatch('setHighlightedFeatureId', {
        highlightedFeatureId: null,
        ...dispatcher,
    })
}
</script>

<template>
    <div
        class="feature-list"
        :class="{ 'feature-list-row': direction === 'row' }"
        data-cy="highlighted-features"
    >
        <FeatureDetail
            v-for="(feature, index) in features"
            :key="feature.id ?? index"
            :feature="feature"
            class="feature-list-item"
            @mouseenter.passive="highlightFeature(feature)"
            @mouseleave.passive="clearHighlightedFeature"
        />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@import 'src/scss/variables-admin.module';

.feature-list {
    margin: 0;
    list-style: none;

    &-item {
        $item-border: $border-width solid $border-color;
        border-right: $item-border;
        border-bottom: $item-border;
        &:hover {
            background-color: rgba($mocassin-to-red-1, 0.8);
        }
    }
    &-row {
        display: grid;
        // on mobile (default size) only one column
        // see media query under for other screen sizes
        grid-template-columns: 1fr;
        max-height: 50vh;
        overflow-y: auto;
    }
}

@include respond-above(md) {
    .feature-list-row {
        // with screen larger than 768px we can afford to have two tooltip side by side
        grid-template-columns: 1fr 1fr;
        max-height: 33vh;
    }
}
@include respond-above(lg) {
    .feature-list-row {
        // with screen larger than 992px we can place 3 tooltips
        grid-template-columns: 1fr 1fr 1fr;
        max-height: 25vh;
    }
}
@include respond-above(xl) {
    .feature-list-row {
        // anything above 1200px will have 4 tooltips in a row
        grid-template-columns: 1fr 1fr 1fr 1fr;
    }
}
</style>
