<template>
    <slot />
</template>

<script>
import drawingInteractionMixin from '@/modules/drawing/components/drawingInteraction.mixin'
import { DrawingModes } from '@/store/modules/drawing.store'
import { MEDIUM, RED } from '@/utils/featureStyleUtils'
import GeometryType from 'ol/geom/GeometryType'

export default {
    mixins: [drawingInteractionMixin],
    data() {
        return {
            drawingMode: DrawingModes.ANNOTATION,
            geometryType: GeometryType.POINT,
            extraProperties: {
                color: RED.fill,
                text: 'new text',
                font: MEDIUM.font,
                textScale: MEDIUM.textScale,
            },
        }
    },
}
</script>

<style lang="scss"></style>
