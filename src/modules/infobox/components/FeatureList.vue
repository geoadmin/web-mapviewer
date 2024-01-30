<script setup>
import { computed, toRefs } from 'vue'
import { useStore } from 'vuex'

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

function generateFeatureIdForList(feature, indexInList) {
    let featureId = feature.id || indexInList
    if (feature.layer) {
        featureId = `${feature.layer.id}-${featureId}`
    }
    return featureId
}
</script>

<template>
    <ul
        class="feature-list"
        :class="{ 'feature-list-row': direction === 'row' }"
        data-cy="highlighted-features"
    >
        <!-- eslint-disable vue/no-v-html-->
        <li
            v-for="(feature, index) in features"
            :key="generateFeatureIdForList(feature, index)"
            class="feature-list-item"
            data-infobox="height-reference"
            v-html="feature.htmlPopup"
        />
        <!-- eslint-enable vue/no-v-html-->
    </ul>
</template>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';

.feature-list {
    margin: 0;
    padding: 0;
    list-style: none;

    &-row {
        display: grid;
        // on mobile (default size) only one column
        // see media query under for other screen sizes
        grid-template-columns: 1fr;
        max-height: 50vh;
        overflow-y: auto;
        grid-gap: 8px;
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

// Styling for external HTML content
:global(.htmlpopup-container) {
    width: 100%;
    font-size: 11px;
    text-align: start;
}
:global(.htmlpopup-header) {
    background-color: #e9e9e9;
    padding: 7px;
    margin-bottom: 7px;
    font-weight: 700;
}
:global(.htmlpopup-content) {
    padding: 7px;
}
</style>
