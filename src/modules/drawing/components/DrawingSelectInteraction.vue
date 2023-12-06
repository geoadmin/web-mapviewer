<template>
    <slot />
</template>

<script>
import SelectInteraction from 'ol/interaction/Select'
import ObjectEventType from 'ol/ObjectEventType'
import { mapActions, mapState } from 'vuex'

import { DRAWING_HIT_TOLERANCE } from '@/config'
import { editingFeatureStyleFunction } from '@/modules/drawing/lib/style'

/**
 * Manages the selection of features on the drawing layer. Shares also which features are selected
 * (as OpenLayers objects) so that other interaction that requires them can have them without
 * centralizing all the code in one place (as it was before). It will also update the selected
 * feature (style, color, etc...) whenever it is edited through the popover.
 *
 * This component will emit events :
 *
 * - `featureChange`: Triggered whenever the style of the selected feature changes
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
    emits: ['featureChange'],
    expose: ['selectFeature'],
    data() {
        return {
            /** OpenLayers feature currently selected */
            currentlySelectedFeature: null,
        }
    },
    computed: {
        ...mapState({
            selectedFeatures: (state) => state.features.selectedFeatures,
        }),
    },
    watch: {
        selectedFeatures(newSelectedFeatures) {
            /* if the store doesn't contain any more feature, we clear our local variable on that topic
            This makes it possible for other modules to call clearAllSelectedFeatures()
            Other modules cannot however call setSelectedFeatures() from the store, as we cannot
            infer the OlFeature from the store feature. They instead have to call the exposed
            selectFeature() function from this module. */
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
                this.setSelectedFeatures([newFeature.get('editableFeature')])
            } else {
                this.clearAllSelectedFeatures()
            }
            if (oldFeature) {
                // editableFeature was removed from the state just before, so we can edit it directly again.
                oldFeature
                    .get('editableFeature')
                    .removeListener('change:style', this.emitFeatureChangeEvent)
            }
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
        ...mapActions(['setSelectedFeatures', 'clearAllSelectedFeatures']),
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
            /* This triggers a call to the style function (see style.js)
            One would think that calling 'this.currentlySelectedFeature.changed()' would be simpler,
            but it turns out that calling the beforementioned function breaks the modifyInteraction
            (a marker / text stays dragable even after deselecting when its style was changed). This
            may be a bug in openlayers. (as of 08-2022) */
            this.currentlySelectedFeature.dispatchEvent(ObjectEventType.PROPERTYCHANGE)
            this.$emit('featureChange', feature) // So that the drawing module can save the changes
        },
    },
}
</script>
