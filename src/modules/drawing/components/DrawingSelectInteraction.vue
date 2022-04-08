<template>
    <slot />
</template>

<script>
import { EditableFeature } from '@/api/features.api'
import { extractOpenLayersFeatureCoordinates } from '@/modules/drawing/lib/drawingUtils'
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
        /** Store selected features (instances of {@link EditableFeature}) */
        selectedFeatures: {
            type: Array,
            required: true,
        },
    },
    emits: ['featureSelect', 'featureUnselect', 'featureChange'],
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
                this.currentlySelectedFeature = null
            }
        },
        currentlySelectedFeature(newFeature) {
            this.clearSelectedFeature()
            if (newFeature) {
                // creating an editable feature with all the data from the drawing overlay
                const featureForStore = new EditableFeature(
                    `drawing_feature_${newFeature.getId()}`,
                    extractOpenLayersFeatureCoordinates(newFeature),
                    newFeature.get('text'),
                    newFeature.get('description'),
                    newFeature.get('drawingMode'),
                    newFeature.get('textColor'),
                    newFeature.get('textSize'),
                    newFeature.get('fillColor'),
                    newFeature.get('icon'),
                    newFeature.get('iconSize')
                )
                // binding store feature change events to our handlers
                // so that we can update the style of the OL features as soon
                // as the store feature is edited
                this.bindFeatureEvents(featureForStore)
                this.$emit('featureSelect', featureForStore)
                // adding the feature to the list, so that modify interaction can edit it
                this.selectInteraction.getFeatures().push(newFeature)
            } else {
                this.$emit('featureUnselect')
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
        onSelectChange(event) {
            // The select event lists the changes in two arrays: selected, deselected
            // As we only allow for one feature to be selected at a time this event
            // will always yield one item in either of the arrays.
            if (event.selected.length > 0) {
                this.selectFeature(event.selected[0])
            } else {
                this.selectFeature(null)
            }
        },
        selectFeature(olFeature) {
            this.currentlySelectedFeature = olFeature
        },
        clearSelectedFeature() {
            this.selectInteraction.getFeatures().clear()
        },
        emitFeatureChangeEvent(feature) {
            this.$emit('featureChange', feature)
        },
        //----------------------------------------------------------------------
        // Bindings between the currently edited feature and the one stored in Vuex
        //----------------------------------------------------------------------
        bindFeatureEvents(feature) {
            if (feature) {
                feature.on('change:title', this.updateFeatureTitle)
                feature.on('change:description', this.updateFeatureDescription)
                feature.on('change:textColor', this.updateFeatureTextColor)
                feature.on('change:textSize', this.updateFeatureTextSize)
                feature.on('change:fillColor', this.updateFeatureFillColor)
                feature.on('change:fillColor', this.updateFeatureIcon)
                feature.on('change:icon', this.updateFeatureIcon)
                feature.on('change:iconSize', this.updateFeatureIcon)
            }
        },
        unbindFeatureEvents(feature) {
            if (feature) {
                feature.removeListener('change:title', this.updateFeatureTitle)
                feature.removeListener('change:description', this.updateFeatureDescription)
                feature.removeListener('change:textColor', this.updateFeatureTextColor)
                feature.removeListener('change:textSize', this.updateFeatureTextSize)
                feature.removeListener('change:fillColor', this.updateFeatureFillColor)
                feature.removeListener('change:fillColor', this.updateFeatureIcon)
                feature.removeListener('change:icon', this.updateFeatureIcon)
                feature.removeListener('change:iconSize', this.updateFeatureIcon)
            }
        },
        updateFeatureTitle(feature) {
            this.currentlySelectedFeature?.set('text', feature.title)
            this.emitFeatureChangeEvent(feature)
        },
        updateFeatureDescription(feature) {
            this.currentlySelectedFeature?.set('description', feature.description)
            this.emitFeatureChangeEvent(feature)
        },
        updateFeatureTextColor(feature) {
            this.currentlySelectedFeature?.set('color', feature.textColor.fill)
            this.currentlySelectedFeature?.set('strokeColor', feature.textColor.border)
            this.emitFeatureChangeEvent(feature)
        },
        updateFeatureTextSize(feature) {
            this.currentlySelectedFeature?.set('font', feature.textSize.font)
            this.currentlySelectedFeature?.set('textScale', feature.textSizeScale)
            this.emitFeatureChangeEvent(feature)
        },
        updateFeatureFillColor(feature) {
            this.currentlySelectedFeature?.set('color', feature.fillColor.fill)
            this.emitFeatureChangeEvent(feature)
        },
        updateFeatureIcon(feature) {
            this.currentlySelectedFeature?.set('iconUrl', feature.iconUrl)
            this.emitFeatureChangeEvent(feature)
        },
    },
}
</script>
