import { EditableFeature } from '@/api/features.api'
import { editingFeatureStyleFunction, featureStyleFunction } from '@/modules/drawing/lib/style'
import DrawInteraction from 'ol/interaction/Draw'
import { getUid } from 'ol/util'
import { wrapXCoordinates } from '@/modules/drawing/lib/drawingUtils'
import { mapState } from 'vuex'

/**
 * Vue mixin that will handle the addition or removal of a drawing interaction to the drawing
 * module.
 *
 * This interaction will be responsible for one of the many shape available to draw. It will handle
 * the start and ending of the drawing (later edition will be handled elsewhere)
 *
 * Each component using this mixin must define some data (or methods) :
 *
 * - `editableFeatureArgs`: either an object or a function (with no args) returning an object. This
 *   defines the values that should be applied to the {@link EditableFeature} constructor. Note that
 *   id and coordinates are automatically set by this mixin and that if a parameter is missing, its
 *   default value will be used. Only 'featureType' is obligatory.
 * - `geometryType`: which geometry type (from OL type) is being drawn on the map by this interaction
 *
 * It is also possible to define optionals :
 *
 * - `onDrawStart` (function): called after the drawing has started with the feature being drawn as
 *   argument
 * - `onDrawEnd` (function): called after the drawing is done with the drawn feature as argument
 * - `onDrawAbort` (function): called when the drawing is aborted with the aborted feature as argument
 * - `editingStyle` (function): style function used while drawing, if none given
 *   {@link editingFeatureStyleFunction} will be used. Note that the draw interaction passes three
 *   different types of features to this interaction. The actual feature being drawn (in our case a
 *   polygon), a Linestring (connecting all points already drawn) and a Point for the last point
 *   drawn. The two helping features (linestring and point) are automatically deleted when the
 *   drawing is finished.
 * - `featureStyle` (function): style applied to the feature as soon as it is done being drawn, will
 *   use {@link featureStyleFunction} if none is given
 */
const drawingInteractionMixin = {
    inject: ['getDrawingLayer', 'getMap'],
    emits: ['drawStart', 'drawEnd'],
    computed: {
        ...mapState({
            projection: (state) => state.position.projection,
        }),
    },
    mounted() {
        this.interaction = new DrawInteraction({
            style: this.editingStyle || editingFeatureStyleFunction,
            type: this.geometryType || 'Point',
            source: this.getDrawingLayer().getSource(),
            minPoints: 2, // As by default polygon geometries require at least 3 points
            wrapX: true,
        })
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
                /* setting a unique ID for each feature. getUid() is unique as long as the app
                isn't reloaded. The first part is a time stamp to guarante uniqueness even after
                reloading the app. Ps: We can not fully rely on the time stamp as some browsers may
                make the timestamp less precise to increase privacy. */
                const uid =
                    'drawing_feature_' +
                    Math.trunc(Date.now() / 1000) +
                    ('000' + getUid(feature)).slice(-3)
                feature.setId(uid)
                const args =
                    typeof this.editableFeatureArgs === 'function'
                        ? this.editableFeatureArgs()
                        : this.editableFeatureArgs
                args.id = uid
                args.coordinates = null

                /* applying extra properties that should be stored with that feature. Openlayers will
                automatically redraw the feature if these properties change, but not in a recursive
                manner. This means that if e.g. a property inside of the editableFeature changes, an
                update must be triggered manually.*/
                feature.setProperties({
                    editableFeature: EditableFeature.newFeature(args),
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
            if (typeof this.onDrawEndTransformPolygonIntoLineIfNeeded === 'function') {
                this.onDrawEndTransformPolygonIntoLineIfNeeded(event)
            }
            /* Normalize the coordinates, as the modify interaction is configured to operate only
            between -180 and 180 deg (so that the features can be modified even if the view is of
            by 360deg) */
            const geometry = feature.getGeometry()
            const normalizedCoords = wrapXCoordinates(
                geometry.getCoordinates(),
                this.projection,
                true
            )
            geometry.setCoordinates(normalizedCoords)

            let editableFeature = feature.get('editableFeature')
            editableFeature.setCoordinatesFromFeature(feature)

            // removing the flag we've set above in onDrawStart (this feature is now drawn)
            feature.unset('isDrawing')
            // setting the definitive style function for this feature (thus replacing the editing style from the interaction)
            // This function will be automatically recalled every time the feature object is modified or rerendered.
            // (so there is no need to recall setstyle after modifying an extended property)
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
