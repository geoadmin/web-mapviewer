<template>
    <slot />
</template>

<script>
import drawingInteractionMixin from '@/modules/drawing/components/drawingInteraction.mixin'
import { EditableFeatureTypes } from '@/api/features.api'

export default {
    mixins: [drawingInteractionMixin],
    props: {
        availableIconSets: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            geometryType: 'Point',
        }
    },
    methods: {
        editableFeatureArgs() {
            const defaultIconSet = this.availableIconSets.find((set) => set.name === 'default')
            const defaultIcon = defaultIconSet.icons[0]
            return {
                icon: defaultIcon,
                featureType: EditableFeatureTypes.MARKER,
            }
        },
    },
}
</script>

<style lang="scss"></style>
