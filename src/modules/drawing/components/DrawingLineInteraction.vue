<template>
    <slot />
</template>

<script>
import { EditableFeatureTypes } from '@/api/features.api'
import drawingInteractionMixin from '@/modules/drawing/components/drawingInteraction.mixin'
import drawingLineMixin from '@/modules/drawing/components/drawingLine.mixin'
import { drawLineStyle } from '@/modules/drawing/lib/style'
import { GeodesicGeometries } from '@/utils/geodesicManager'

export default {
    mixins: [drawingInteractionMixin, drawingLineMixin],
    data() {
        return {
            geometryType: 'Polygon',
            editingStyle: drawLineStyle,
            editableFeatureArgs: {
                featureType: EditableFeatureTypes.LINEPOLYGON,
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
