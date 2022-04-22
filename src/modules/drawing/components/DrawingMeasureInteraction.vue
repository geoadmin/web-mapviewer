<template>
    <slot />
</template>

<script>
import drawingInteractionMixin from '@/modules/drawing/components/drawingInteraction.mixin'
import drawingLineMixin from '@/modules/drawing/components/drawingLine.mixin'
import MeasureManager from '@/modules/drawing/lib/MeasureManager'
import { drawMeasureStyle } from '@/modules/drawing/lib/style'
import { DrawingModes } from '@/store/modules/drawing.store'
import { RED } from '@/utils/featureStyleUtils'
import GeometryType from 'ol/geom/GeometryType'

export default {
    mixins: [drawingInteractionMixin, drawingLineMixin],
    inject: ['getMap', 'getDrawingLayer'],
    data() {
        return {
            drawingMode: DrawingModes.MEASURE,
            geometryType: GeometryType.POLYGON,
            extraProperties: {
                color: RED.fill,
            },
            editingStyle: drawMeasureStyle,
            featureStyle: drawMeasureStyle,
        }
    },
    created() {
        this.measureManager = new MeasureManager(this.getMap(), this.getDrawingLayer())
    },
    unmounted() {
        this.measureManager = null
    },
    methods: {
        /**
         * Declaring optional mixin method onDrawStart to register the measure manager (the code
         * responsible for showing points with distances while sketching the measure line)
         *
         * See {@link drawingInteractionMixin}
         */
        onDrawStart(feature) {
            this.measureManager.addOverlays(feature)
        },
        /**
         * Declaring the optional mixin method onDrawEnd to unregister the measure manager
         *
         * See {@link drawingInteractionMixin}
         */
        onDrawEnd(feature) {
            this.measureManager.removeOverlays(feature)
        },
    },
}
</script>

<style lang="scss"></style>
