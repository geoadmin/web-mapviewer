import { LineString, Polygon } from 'ol/geom'
import SnapInteraction from 'ol/interaction/Snap'

/**
 * Mixin that will count how many points are drawn by the user while drawing a line (or measure
 * line) and check for point snapping. It will then decide if the drawn geometry should be converted
 * to a line after drawing has ended (ff the user finished drawing by closing the polygon, nothing is done)
 *
 * This mixin must be used with the other drawing mixin (`drawingInteraction.mixin.js`) because it
 * will assume that there is an interaction object stored on `this.interaction` and that it is the
 * interaction responsible to draw the line. This interaction is created and managed by the other mixin.
 */
const drawingLineMixin = {
    inject: ['getMap', 'getDrawingLayer'],
    data() {
        return { counterLinePolyPoints: 0 }
    },
    mounted() {
        // we add a snap interaction for line drawing (so that closing the line into a polygon is easier)
        this.snapInteraction = new SnapInteraction({
            source: this.getDrawingLayer().getSource(),
        })
        this.getMap().addInteraction(this.snapInteraction)

        // registering events on the interaction created by the other mixin
        this.interaction.on('drawstart', this.onDrawStartResetPointCounter)
        this.interaction.on('drawend', this.onDrawEndTransformPolygonIntoLineIfNeeded)
        this.interaction.getOverlay().getSource().on('addfeature', this.checkIfSnapping)
    },
    beforeUnmount() {
        this.interaction.getOverlay().getSource().un('addfeature', this.checkIfSnapping)
        this.interaction.un('drawend', this.onDrawEndTransformPolygonIntoLineIfNeeded)
        this.interaction.un('drawstart', this.onDrawStartResetPointCounter)
        // removing snap interaction
        this.getMap().removeInteraction(this.snapInteraction)
        this.snapInteraction = null
    },
    methods: {
        /**
         * As OL thinks it is drawing a polygon, it will always add the first point as the last,
         * even if not finished, so we remove it before performing our checks
         */
        getFeatureCoordinatesWithoutExtraPoint(feature) {
            return feature.getGeometry().getCoordinates()[0].slice(0, -1)
        },
        onDrawStartResetPointCounter() {
            this.counterLinePolyPoints = 0
        },
        onDrawEndTransformPolygonIntoLineIfNeeded(event) {
            const feature = event.feature
            // checking if drawing was finished while linking the first point with the last
            // (if snapping occurred while placing the last point)
            const coordinates = this.getFeatureCoordinatesWithoutExtraPoint(feature)
            if (coordinates.length > 1 && !this.isSnappingOnFirstPoint) {
                // if not the same ending point, it is not a polygon (the user didn't finish drawing by closing it)
                // so we transform the drawn polygon into a linestring
                feature.setGeometry(new LineString(coordinates))
            }
        },
        checkIfSnapping(event) {
            const feature = event.feature
            // only checking if the geom is a polygon (it as more than one point)
            if (feature.getGeometry() instanceof Polygon) {
                const lineCoords = this.getFeatureCoordinatesWithoutExtraPoint(feature)
                // if point count isn't the same, we update it
                if (this.counterLinePolyPoints !== lineCoords.length) {
                    // A point is added or removed, updating sketch points counter
                    this.counterLinePolyPoints = lineCoords.length
                } else if (lineCoords.length > 1) {
                    const firstPoint = lineCoords[0]
                    const lastPoint = lineCoords[lineCoords.length - 1]
                    const sketchPoint = lineCoords[lineCoords.length - 2]

                    // Checks is snapped to first point of geom
                    const isSnapOnFirstPoint =
                        lastPoint[0] === firstPoint[0] && lastPoint[1] === firstPoint[1]

                    // Checks is snapped to last point of geom
                    const isSnapOnLastPoint =
                        lastPoint[0] === sketchPoint[0] && lastPoint[1] === sketchPoint[1]

                    this.isSnappingOnFirstPoint = !isSnapOnLastPoint && isSnapOnFirstPoint
                }
            }
        },
    },
}

export default drawingLineMixin
