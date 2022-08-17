<template>
    <slot />
</template>

<script>
import drawingInteractionMixin from '@/modules/drawing/components/drawingInteraction.mixin'
import drawingLineMixin from '@/modules/drawing/components/drawingLine.mixin'
import { drawMeasureStyle } from '@/modules/drawing/lib/style'
import { DrawingModes } from '@/store/modules/drawing.store'
import { RED } from '@/utils/featureStyleUtils'

export default {
    mixins: [drawingInteractionMixin, drawingLineMixin],
    inject: ['getMap', 'getDrawingLayer', 'getMeasureManager'],
    data() {
        return {
            drawingMode: DrawingModes.MEASURE,
            geometryType: 'Polygon',
            extraProperties: {
                color: RED.fill,
            },
            editingStyle: drawMeasureStyle,
            featureStyle: drawMeasureStyle,
        }
    },
    methods: {
        /**
         * Declaring optional mixin method onDrawStart to register the measure manager (the code
         * responsible for showing points with distances while sketching the measure line)
         *
         * See {@link drawingInteractionMixin}
         */
        onDrawStart(feature) {
            this.getMeasureManager().addOverlays(feature)
        },
        /**
         * Declaring optional mixin method onDrawEnd to force remove any overlays. The
         * updateOverlays event will regenerate them right after that. This is a hack to make
         * updateOverlays work correctly. A fix in updateOverlays would probably be better.
         *
         * See {@link drawingInteractionMixin}
         */
        onDrawEnd(feature) {
            this.getMeasureManager().removeOverlays(feature)
        },

        /**
         * Declaring optional mixin method onDrawAbort to unregister the resource Manager for the
         * aborted feature
         *
         * See {@link drawingInteractionMixin}
         */
        onDrawAbort(feature) {
            this.getMeasureManager().removeOverlays(feature)
            feature.set('overlays', undefined)
        },
    },
}
</script>

<style lang="scss"></style>
