<script setup>
import { EditableFeature } from '@/api/features.api'
import { toRef } from 'vue'
import FeatureProfile from './FeatureElevationProfile.vue'
import FeatureStyleEdit from './styling/FeatureStyleEdit.vue'

const props = defineProps({
    feature: {
        type: EditableFeature,
        required: true,
    },
    readOnly: {
        type: Boolean,
        default: false,
    },
})
const { feature, readOnly } = toRef(props)
</script>

<template>
    <div class="edit-feature" data-infobox="height-reference">
        <div class="edit-feature-form">
            <FeatureStyleEdit :feature="feature" :read-only="readOnly" />
        </div>
        <FeatureProfile class="edit-feature-plot" :feature="feature" :read-only="readOnly" />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';

// minmax(0, 1fr) is needed as 1fr is equivalent to minmax(auto, 1fr) where auto
// is the size of the content. Which in turn leads to cells that are too wide.
// https://stackoverflow.com/a/52861514

.edit-feature {
    display: grid;
    // on mobile (default size) only one column
    // see media query under for other screen sizes
    grid-template-columns: minmax(0, 1fr);
    grid-gap: 8px;
}

@include respond-above(md) {
    .edit-feature {
        grid-template-columns: 40% minmax(0, 1fr);
    }
}
@include respond-above(lg) {
    .edit-feature {
        grid-template-columns: 30% minmax(0, 1fr);
    }
}
@include respond-above(xl) {
    .edit-feature {
        grid-template-columns: 20% minmax(0, 1fr);
    }
}
</style>
