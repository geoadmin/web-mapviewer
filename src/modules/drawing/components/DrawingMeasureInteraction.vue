<template>
    <slot />
</template>

<script>
import { EditableFeatureTypes } from '@/api/features.api'
import { DEFAULT_PROJECTION } from '@/config'
import drawingInteractionMixin from '@/modules/drawing/components/drawingInteraction.mixin'
import drawingLineMixin from '@/modules/drawing/components/drawingLine.mixin'
import { drawMeasureStyle } from '@/modules/drawing/lib/style'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { GeodesicGeometries } from '@/utils/geodesicManager'

export default {
    mixins: [drawingInteractionMixin, drawingLineMixin],
    inject: ['getMap', 'getDrawingLayer'],
    data() {
        return {
            geometryType: 'Polygon',
            editingStyle: drawMeasureStyle,
            editableFeatureArgs: {
                featureType: EditableFeatureTypes.MEASURE,
            },
        }
    },
    methods: {
        /**
         * Declaring optional mixin method onDrawStart to register the geodesic manager (the code
         * responsible for generating the geodesic geometries of this feature and the styles that
         * display points with distances on the line)
         *
         * See {@link drawingInteractionMixin}
         */
        onDrawStart(feature) {
            feature.geodesic = new GeodesicGeometries(feature, this.projection)
        },
    },
}
</script>

<style lang="scss"></style>
