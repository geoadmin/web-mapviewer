<template>
    <div class="feature-edit" data-infobox="height-reference">
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
            @delete="$emit('delete', $event)"
        />
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { EditableFeature } from '@/api/features.api'
import FeatureStyleEdit from './styling/FeatureStyleEdit.vue'

export default {
    components: {
        FeatureStyleEdit,
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
        'delete',
    ],
    computed: {
        ...mapState({
            availableIconSets: (state) => state.drawing.iconSets,
        }),
    },
}
</script>
