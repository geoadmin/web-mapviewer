import { editingFeatureStyleFunction, featureStyleFunction } from '@/modules/drawing/lib/style'
import { DrawingModes } from '@/store/modules/drawing.store'
import GeometryType from 'ol/geom/GeometryType'
import DrawInteraction from 'ol/interaction/Draw'
import { getUid } from 'ol/util'

/**
 * Vue mixin that will handle the addition or removal of a drawing interaction to the drawing module.
 *
 * This interaction will be responsible for one of the many shape available to draw. It will handle
 * the start and ending of the drawing (later edition will be handled elsewhere)
 *
 * Each component using this mixin must define some data (or methods) :
 *
 * - `extraProperties`: either an object or a function (with no args) returning an object. This
 *   defines some props that will be set in each feature's metadata created by this interaction
 *   (i.e. the fill color used, which size the text should be, etc...)
 * - `drawingMode`: which drawing mode (from {@link DrawingModes}) is being used with this interaction
 * - `geometryType`: which geometry type (from OL {@link GeometryType}) is being drawn on the map by
 *   this interaction
 *
 * It is also possible to define optionals :
 *
 * - `onDrawStart` (function): called after the drawing has started with the feature being drawn as argument
 * - `onDrawEnd` (function): called after the drawing is done with the drawn feature as argument
 * - `onDrawAbort` (function): called when the drawing is aborted with the aborted feature as argument
 * - `editingStyle` (function): style function used while drawing, if none given
 *   {@link editingFeatureStyleFunction} will be used
 * - `featureStyle` (function): style applied to the feature as soon as it is done being drawn, will
 *   use {@link featureStyleFunction} if none is given
 */
const drawingInteractionMixin = {
    inject: ['getDrawingLayer', 'getMap'],
    emits: ['drawStart', 'drawEnd'],
    mounted() {
        this.interaction = new DrawInteraction({
            style: this.editingStyle || editingFeatureStyleFunction,
            type: this.geometryType || GeometryType.POINT,
            source: this.getDrawingLayer().getSource(),
        })
        this.interaction.set('drawingMode', this.drawingMode || DrawingModes.MARKER)
        this.activate()
    },
    unmounted() {
        this.deactivate()
        this.interaction = null
    },
    methods: {
        activate() {
            this.interaction.setActive(true)

            this.interaction.getOverlay().getSource().on('addfeature', this.onAddFeature)
            this.interaction.on('drawstart', this._onDrawStart)
            this.interaction.on('drawend', this._onDrawEnd)
            this.interaction.on('drawabort', this._onDrawAbort)

            this.getMap().addInteraction(this.interaction)
        },
        deactivate() {
            this.getMap().removeInteraction(this.interaction)

            this.interaction.setActive(false)

            this.interaction.un('drawend', this._onDrawEnd)
            this.interaction.un('drawstart', this._onDrawStart)
            this.interaction.un('drawabort', this._onDrawAbort)
            this.interaction.getOverlay().getSource().un('addfeature', this.onAddFeature)
        },
        onAddFeature(event) {
            const feature = event.feature
            if (!feature.getId()) {
                // setting a unique ID for each feature (using the feature metadata as seed for the UID generation)
                feature.setId(getUid(feature))
                // applying any extra properties that are required for this kind of feature (Components that uses this mixin
                // can define either a function that receive the feature as param, or an object containing the things we need
                // to set in each feature of this type)
                const props =
                    typeof this.extraProperties === 'function'
                        ? this.extraProperties()
                        : this.extraProperties
                feature.setProperties({
                    type: this.geometryType,
                    drawingMode: this.drawingMode,
                    ...props,
                })
            }
        },
        _onDrawStart(event) {
            const feature = event.feature
            // we set a flag telling that this feature is currently being drawn (for the first time, not edited)
            feature.set('isDrawing', true)
            // if optional onDrawStart is defined, we call it
            if (this.onDrawStart) {
                this.onDrawStart(feature)
            }
            // bubbling draw start event with the feature
            this.$emit('drawStart', feature)
        },
        _onDrawEnd(event) {
            // deactivating the interaction (so that the user doesn't create another feature right after this one)
            // this does not change the state, for that we will bubble the event so that the parent will then
            // dispatch changes to the store
            this.deactivate()
            // grabbing the drawn feature so that we send it through the event
            const feature = event.feature
            // removing the flag we've set above in onDrawStart (this feature is now drawn)
            feature.unset('isDrawing')
            // setting the definitive style function for this feature (thus replacing the editing style from the interaction)
            feature.setStyle(this.featureStyle || featureStyleFunction)
            // if optional onDrawEnd is defined, we call it
            if (this.onDrawEnd) {
                this.onDrawEnd(feature)
            }
            // see https://openlayers.org/en/latest/apidoc/module-ol_interaction_Draw-Draw.html#finishDrawing
            this.interaction.finishDrawing()
            this.$emit('drawEnd', feature)
        },
        _onDrawAbort(event) {
            // if optional onDrawAbort is defined, we call it
            if (this.onDrawAbort) {
                this.onDrawAbort(event.feature)
            }
        },
        removeLastPoint() {
            this.interaction.removeLastPoint()
        },
    },
}

export default drawingInteractionMixin
