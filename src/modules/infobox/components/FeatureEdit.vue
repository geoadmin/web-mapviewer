<template>
    <div class="feature-edit" data-infobox="height-reference">
        <FeatureStyleEdit
            :feature="feature"
            :available-icon-sets="availableIconSets"
            :read-only="readOnly"
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
        readOnly: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        ...mapState({
            availableIconSets: (state) => state.drawing.iconSets,
        }),
    },
}
</script>
