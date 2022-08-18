<template>
    <slot />
</template>

<script>
import { editingFeatureStyleFunction } from '@/modules/drawing/lib/style'
import SelectInteraction from 'ol/interaction/Select'
import { DRAWING_HIT_TOLERANCE } from '@/config'

/**
 * Manages the selection of features on the drawing layer. Shares also which features are selected
 * (as OpenLayers objects) so that other interaction that requires them can have them without
 * centralizing all the code in one place (as it was before).
 *
 * This component will emit events :
 *
 * - `featureSelect`: whenever one is selected, with a feature object from `feature.api.js` as argument
 * - `featureUnselect`: when the user clicks somewhere else on the map, thus deselecting any selected
 *   feature. Will not trigger the event if nothing was selected and the user clicks in the void.
 *
 * It will also update the selected feature (style, color, etc...) whenever it is edited through the popover.
 */
export default {
    inject: ['getMap', 'getDrawingLayer'],
    provide() {
        return {
            /**
             * Sharing select interaction. This is required for modify interaction (see
             * {@link DrawingModifyInteraction})
             */
            getSelectInteraction: () => this.selectInteraction,
        }
    },
    props: {
        selectedFeatures: {
            type: Array,
            required: true,
        },
    },
    emits: ['featureSelect', 'featureUnselect', 'featureChange'],
    expose: ['selectFeature'],
    data() {
        return {
            /** OpenLayers feature currently selected */
            currentlySelectedFeature: null,
        }
    },
    watch: {
        selectedFeatures(newSelectedFeatures) {
            // if the store doesn't contain any more feature, we clear our local variable on that topic
            if (!newSelectedFeatures || newSelectedFeatures.length === 0) {
                this.selectFeature(null)
            }
        },
        currentlySelectedFeature(newFeature, oldFeature) {
            if (newFeature) {
                // binding store feature change events to our handlers
                // so that we can update the style of the OL features as soon
                // as the store feature is edited
                newFeature.get('editableFeature').on('change:style', this.emitFeatureChangeEvent)
                this.$emit('featureSelect', newFeature.get('editableFeature'))
            } else {
                this.$emit('featureUnselect')
            }
            // if (oldFeature) {
            //     oldFeature
            //         .get('editableFeature')
            //         .removeListener('change', this.emitFeatureChangeEvent)
            // }
        },
    },
    created() {
        // as we provide select interaction's features for other components
        // we need to create the interaction at the start (so that provide has something to give)
        this.selectInteraction = new SelectInteraction({
            style: editingFeatureStyleFunction,
            toggleCondition: () => false,
            layers: [this.getDrawingLayer()],
            // As we've seen with the old viewer, some small features were hard
            // to select. We will try to add a bigger hit tolerance to mitigate that.
            hitTolerance: DRAWING_HIT_TOLERANCE,
        })
    },
    mounted() {
        this.selectInteraction.setActive(true)
        this.selectInteraction.on('select', this.onSelectChange)
        this.getMap().addInteraction(this.selectInteraction)
    },
    unmounted() {
        this.selectInteraction.setActive(false)
        this.getMap().removeInteraction(this.selectInteraction)
        this.selectInteraction.un('select', this.onSelectChange)
        this.selectInteraction = null
    },
    methods: {
        /** Change the selected feature programmatically. */
        selectFeature(olFeature) {
            this.selectInteraction.getFeatures().clear()
            if (olFeature) {
                this.selectInteraction.getFeatures().push(olFeature)
            }
            this.currentlySelectedFeature = olFeature
        },

        /** Change the selected feature by user input. */
        onSelectChange(event) {
            // The select event lists the changes in two arrays: selected, deselected
            // As we only allow for one feature to be selected at a time this event
            // will always yield one item in either of the arrays.
            if (event.selected.length > 0) {
                this.currentlySelectedFeature = event.selected[0]
            } else {
                this.currentlySelectedFeature = null
            }
        },
        emitFeatureChangeEvent(feature) {
            this.currentlySelectedFeature.changed()
            this.$emit('featureChange', feature)
        },
    },
}
</script>
