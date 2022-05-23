<template>
    <div class="edit-feature" data-infobox="height-reference">
        <div class="edit-feature-form">
            <FeatureStyleEdit
                :feature="feature"
                :available-icon-sets="availableIconSets"
                @change:title="$emit('change:title', $event)"
                @change:description="$emit('change:description', $event)"
                @change:text-size="$emit('change:textSize', $event)"
                @change:text-color="$emit('change:textColor', $event)"
                @change:color="$emit('change:color', $event)"
                @change:icon="$emit('change:icon', $event)"
                @change:icon-size="$emit('change:iconSize', $event)"
            />
        </div>

        <FeatureProfile class="edit-feature-plot" :feature="feature" />
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { EditableFeature } from '@/api/features.api'
import FeatureStyleEdit from './styling/FeatureStyleEdit.vue'
import FeatureProfile from './FeatureProfile.vue'

export default {
    components: {
        FeatureStyleEdit,
        FeatureProfile,
    },
    props: {
        feature: {
            type: EditableFeature,
            required: true,
        },
    },
    emits: [
        'change:title',
        'change:description',
        'change:textSize',
        'change:textColor',
        'change:color',
        'change:icon',
        'change:iconSize',
    ],
    computed: {
        ...mapState({
            availableIconSets: (state) => state.drawing.iconSets,
        }),
    },
}
</script>

<style lang="scss">
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
