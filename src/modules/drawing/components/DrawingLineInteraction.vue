<template>
    <slot />
</template>

<script>
import drawingInteractionMixin from '@/modules/drawing/components/drawingInteraction.mixin'
import drawingLineMixin from '@/modules/drawing/components/drawingLine.mixin'
import { drawLineStyle } from '@/modules/drawing/lib/style'
import { DrawingModes } from '@/store/modules/drawing.store'
import { RED } from '@/utils/featureStyleUtils'

export default {
    mixins: [drawingInteractionMixin, drawingLineMixin],
    data() {
        return {
            drawingMode: DrawingModes.LINEPOLYGON,
            geometryType: 'Polygon',
            extraProperties: {
                color: RED.fill,
                description: '',
            },
            editingStyle: drawLineStyle,
        }
    },
}
</script>

<style lang="scss"></style>
