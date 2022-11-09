<template>
    <slot />
</template>

<script>
import { DRAWING_HIT_TOLERANCE } from '@/config'
import {
    extractOlFeatureCoordinates,
    extractOlFeatureGeodesicCoordinates,
} from '@/modules/drawing/lib/drawingUtils'
import { editingVertexStyleFunction } from '@/modules/drawing/lib/style'
import { noModifierKeys, singleClick } from 'ol/events/condition'
import ModifyInteraction from '@/modules/drawing/lib/modifyInteraction'
import { mapActions } from 'vuex'
import { segmentExtent, subsegments } from '@/utils/geodesicManager'

const cursorGrabbingClass = 'cursor-grabbing'

/**
 * Will enable the user to edit selected features by drag and dropping part of it on the map. Will
 * also enable point deletion with a right click.
 *
 * This component needs to have access to the selected features from the select interaction (it gets
 * them through a provide/inject coupling)
 *
 * It will emit those events :
 *
 * - `modifyEnd`: when an edit has finished (not necessarily a drag and drop, can also be a point
 *   deletion)
 */
export default {
    inject: ['getMap', 'getSelectInteraction'],
    emits: ['modifyEnd', 'modifyStart'],
    mounted() {
        this.modifyInteraction = new ModifyInteraction({
            // here we can't have the whole drawing layers features (or source)
            // otherwise non-selected features will be editable anytime
            features: this.getSelectInteraction().getFeatures(),
            style: editingVertexStyleFunction,
            deleteCondition: (event) => noModifierKeys(event) && singleClick(event),
            // We disable click on the shape for moving the marker and text features (not for
            // selecting the feature, which is handled by the select interaction!) and use instead
            // pixel tolerance from the coordinate (i.e. the user has to drag the white dot to move
            // the feature)
            // Hit detection has performance issues with geodesic lines. But more importantly, there
            // is a bug (with an unknown cause) where the hit detection breaks when the drawing is
            // closed and reloaded. So after reloading, the markers and text fields may not be
            // movable at all. (The hit detection of the select interaction has not the
            // beforementioned problems)
            hitDetection: false,
            // This seems to be calculated differently than the hitTolerance properties of SelectInteraction
            // and forEachFeatureAtPixel. That's why we have to manually correct the value here.
            pixelTolerance: DRAWING_HIT_TOLERANCE + 2,
            // Pass these callbacks to inform the modify interaction about the correct geometry
            // of each line segment. (By default the modify interaction assumes straight segments,
            // but our segments are curved as they follow the geodesic.)
            segmentExtentFunction: segmentExtent,
            subsegmentsFunction: subsegments,
            // Openlayers has no limit on the longitude, so if you are at 10deg and
            // turn one time around the earth, you will land at 370deg etc.
            // "wrapX" tells openlayers to use a normalized view extent to decide which features
            // to display. So if e.g. your view is [370, 380] of longitude, objects drawn at
            // [370,380] will not be shown. Instead, objects drawn at [10,20] will be shown.
            // "pointerWrapX" tells openlayers if e.g. the user clicks or hovers a point at 370deg,
            // it should be considered as if the user hovered or clicked at 10deg.
            pointerWrapX: true,
            wrapX: true,
        })
        this.modifyInteraction.on('modifystart', this.onModifyStart)
        this.modifyInteraction.on('modifyend', this.onModifyEnd)
        this.getMap().addInteraction(this.modifyInteraction)
    },
    unmounted() {
        this.getMap().removeInteraction(this.modifyInteraction)
        this.modifyInteraction.un('modifyend', this.onModifyEnd)
        this.modifyInteraction.un('modifystart', this.onModifyStart)
        this.modifyInteraction = null
    },
    methods: {
        ...mapActions(['changeFeatureCoordinates', 'changeFeatureIsDragged']),
        onModifyStart(event) {
            const [feature] = event.features.getArray()

            if (feature) {
                this.changeFeatureIsDragged({
                    feature: feature.get('editableFeature'),
                    isDragged: true,
                })
                this.getMap().getTarget().classList.add(cursorGrabbingClass)
                this.$emit('modifyStart', feature)
            }
        },
        onModifyEnd(event) {
            if (!event.features) {
                return
            }

            const [feature] = event.features.getArray()

            if (feature) {
                const storeFeature = feature.get('editableFeature')
                this.changeFeatureIsDragged({
                    feature: storeFeature,
                    isDragged: false,
                })
                this.changeFeatureCoordinates({
                    feature: storeFeature,
                    coordinates: extractOlFeatureCoordinates(feature),
                    geodesicCoordinates: extractOlFeatureGeodesicCoordinates(feature),
                })
                this.getMap().getTarget().classList.remove(cursorGrabbingClass)
                this.$emit('modifyEnd', feature)
            }
        },
    },
}
</script>
