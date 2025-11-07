import type { Coordinate } from 'ol/coordinate'
import type { FeatureLike } from 'ol/Feature'
import type { GeometryFunction } from 'ol/style/Style'

import { type Geometry, LineString, MultiPoint, Point, Polygon } from 'ol/geom'
import RenderFeature from 'ol/render/Feature'
import { Circle, Fill, Style } from 'ol/style'

import { type EditableFeature, isLineOrMeasure } from '@/api/features.api'
import { geoadminStyleFunction } from '@/utils/featureStyleUtils'
import {
    dashedRedStroke,
    redStroke,
    sketchPointStyle,
    StyleZIndex,
    whiteCircleStyle,
    whiteSketchFill,
} from '@/utils/styleUtils'

/**
 * Style function as used by the Modify Interaction. Used to display a translucent point on a line
 * when hovering it to indicate that the user can grab the line to create a new point.
 */
export function editingVertexStyleFunction(
    vertex: FeatureLike,
    _resolution: number
): Style | Style[] | null {
    const associatedFeature = vertex.get('features')[0]
    const editableFeature = associatedFeature?.get('editableFeature') as EditableFeature | undefined
    if (!associatedFeature || (editableFeature && isLineOrMeasure(editableFeature))) {
        return null
    }
    return new Style({
        image: sketchPointStyle,
    })
}

const addingGrabbingPoint: GeometryFunction = (
    feature: FeatureLike
): RenderFeature | Geometry | undefined => {
    const geometry = feature.getGeometry()
    if (!geometry || geometry instanceof RenderFeature) {
        return
    }
    let coordinates: Coordinate[] | undefined
    if (geometry.getType() === 'Polygon') {
        coordinates = (geometry as Polygon).getCoordinates()[0]
    } else if (geometry.getType() === 'LineString') {
        coordinates = (geometry as LineString).getCoordinates()
    }
    if (!coordinates) {
        return
    }
    return new MultiPoint(coordinates)
}

/**
 * Style function (as OpenLayers needs it) that will style features while they are being drawn or
 * edited by our drawing module.
 *
 * Note that the style differs when the feature is selected (or drawn for the first time) or when
 * displayed without interaction (see {@link geoadminStyleFunction} for this case)
 */
export function editingFeatureStyleFunction(
    feature: FeatureLike,
    resolution: number
): Style | Style[] | null {
    /* This style (image tag) will only be shown for point geometries. So this style will display
    the white dot when selecting a symbol or text feature. */
    const styles = [
        new Style({
            image: whiteCircleStyle,
            zIndex: StyleZIndex.WhiteDot,
        }),
    ]
    const geom = feature.getGeometry()
    if (geom instanceof Polygon || geom instanceof LineString) {
        // adding grabbing points at each edge so that the user can grab them and
        // modify the shape of the features (functionality is handled by the modify interaction,
        // this only adds the visual indicators so the user understands that the edges are
        // grabable.)
        styles.push(
            new Style({
                image: whiteCircleStyle,
                geometry: addingGrabbingPoint,
                zIndex: StyleZIndex.WhiteDot,
            })
        )
    }
    const defStyle = geoadminStyleFunction(feature, resolution)
    if (Array.isArray(defStyle)) {
        styles.push(...defStyle)
    } else if (defStyle) {
        styles.push(defStyle)
    }
    return styles
}

/** Return a sketch Point Style */
export function getSketchPointStyle(coordinate: Coordinate): Style {
    return new Style({
        geometry: new Point(coordinate),
        image: new Circle({
            radius: 4,
            fill: new Fill({
                color: [255, 0, 0, 0.4],
            }),
            stroke: redStroke,
        }),
        zIndex: StyleZIndex.WhiteDot,
    })
}

/**
 * This is the styling function used by the draw interaction when drawing a line. See the doc of
 * "drawMeasureStyle" for more information about how this function is invoked.
 */
export function drawLineStyle(sketch: FeatureLike, resolution: number): Style | Style[] | null {
    return drawLineOrMeasureStyle(sketch, resolution, false)
}

/**
 * This is the styling function used by the draw interaction when drawing a measure.
 *
 * Note that the draw interaction passes three different types of features to this interaction. The
 * actual feature being drawn (in our case a polygon), a Linestring (connecting all points already
 * drawn) and a point for the last point drawn. The two helping features (linestring and point) are
 * automatically deleted when the drawing is finished.
 */
export function drawMeasureStyle(sketch: FeatureLike, resolution: number): Style | Style[] | null {
    return drawLineOrMeasureStyle(sketch, resolution, true)
}

export function drawLineOrMeasureStyle(
    sketch: FeatureLike,
    resolution: number,
    displayMeasures: boolean
): Style | Style[] | null {
    const sketchGeometry = sketch.getGeometry()
    if (!sketchGeometry) {
        return null
    }
    const type = sketchGeometry.getType()
    switch (type) {
        case 'Point':
            return getSketchPointStyle((sketchGeometry as Point).getCoordinates())
        case 'Polygon': {
            // lines are drawn as polygon, so both types are covered by this case
            const styles = [
                new Style({
                    stroke: displayMeasures ? dashedRedStroke : redStroke,
                    geometry: sketch.get('geodesic')?.getGeodesicGeom(),
                    zIndex: StyleZIndex.Line,
                }),
            ]
            if (displayMeasures) {
                styles.push(...sketch.get('geodesic').getMeasureStyles(resolution))
            }
            const polygonGeom = sketch.get('geodesic')?.getGeodesicPolygonGeom()
            if (polygonGeom) {
                styles.push(
                    new Style({
                        geometry: polygonGeom,
                        fill: whiteSketchFill,
                        zIndex: StyleZIndex.AzimuthCircle,
                    })
                )
            }
            return styles
        }
    }
    return null
}
