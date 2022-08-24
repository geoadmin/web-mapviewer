<template>
    <slot />
</template>

<script>
import drawingInteractionMixin from '@/modules/drawing/components/drawingInteraction.mixin'
import { DrawingModes } from '@/store/modules/drawing.store'

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
            drawingMode: DrawingModes.MARKER,
            geometryType: 'Point',
        }
    },
    methods: {
        editableFeatureArgs() {
            const defaultIconSet = this.availableIconSets.find((set) => set.name === 'default')
            const defaultIcon = defaultIconSet.icons[0]
            return {
                icon: defaultIcon,
            }
        },
    },
}
</script>

<style lang="scss"></style>
