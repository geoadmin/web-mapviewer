import { LineString, MultiPoint, Point, Polygon } from 'ol/geom'
import { Circle, Fill, Style } from 'ol/style'

import { featureStyleFunction } from '@/utils/featureStyleUtils'
import {
    dashedRedStroke,
    redStroke,
    sketchPointStyle,
    whiteCircleStyle,
    whiteSketchFill,
} from '@/utils/styleUtils.js'

/* Z-INDICES
The z indices for the styles are given according to the following table:
azimuth-circle/fill:       0
main style:                10
line:                      20
measure points:            21
white dot / sketch points: 30
tooltip:                   40
*/

/**
 * Style function as used by the Modify Interaction. Used to display a translucent point on a line
 * when hovering it to indicate that the user can grab the line to create a new point.
 */
export const editingVertexStyleFunction = (vertex) => {
    const associatedFeature = vertex.get('features')[0]
    if (!associatedFeature) return
    return associatedFeature.get('editableFeature')?.isLineOrMeasure()
        ? new Style({
              image: sketchPointStyle,
          })
        : null
}

/**
 * Style function (as OpenLayers needs it) that will style features while they are being drawn or
 * edited by our drawing module.
 *
 * Note that the style differs when the feature is selected (or drawn for the first time) or when
 * displayed without interaction (see {@link featureStyleFunction} for this case)
 */
export const editingFeatureStyleFunction = (feature, resolution) => {
    /* This style (image tag) will only be shown for point geometries. So this style will display
    the white dot when selecting a symbol or text feature. */
    const styles = [
        new Style({
            image: whiteCircleStyle,
            zIndex: 30,
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
                geometry(f) {
                    const geometry = f.getGeometry()
                    let coordinates = geometry.getCoordinates()
                    if (geometry instanceof Polygon) {
                        coordinates = coordinates[0]
                    }
                    return new MultiPoint(coordinates)
                },
                zIndex: 30,
            })
        )
    }
    const defStyle = featureStyleFunction(feature, resolution)
    if (defStyle) {
        styles.push(...defStyle)
    }
    return styles
}

/**
 * Return a sketch Point Style
 *
 * @param {[Number, Number]} coord
 * @returns {Style}
 */
export function getSketchPointStyle(coord) {
    return new Style({
        geometry: new Point(coord),
        image: new Circle({
            radius: 4,
            fill: new Fill({
                color: [255, 0, 0, 0.4],
            }),
            stroke: redStroke,
        }),
        zIndex: 30,
    })
}

/**
 * This is the styling function used by the draw interaction when drawing a line. See the doc of
 * "drawMeasureStyle" for more information about how this function is invoked.
 *
 * @param sketch
 * @returns
 */
export function drawLineStyle(sketch, resolution) {
    return drawLineOrMeasureStyle(sketch, resolution, false)
}

/**
 * This is the styling function used by the draw interaction when drawing a measure.
 *
 * Note that the draw interaction passes three different types of features to this interaction. The
 * actual feature being drawn (in our case a polygon), a Linestring (connecting all points already
 * drawn) and a point for the last point drawn. The two helping features (linestring and point) are
 * automatically deleted when the drawing is finished.
 *
 * @param {any} sketch
 * @returns
 */
export function drawMeasureStyle(sketch, resolution) {
    return drawLineOrMeasureStyle(sketch, resolution, true)
}

export function drawLineOrMeasureStyle(sketch, resolution, displayMeasures) {
    const type = sketch.getGeometry().getType()
    switch (type) {
        case 'Point':
            return getSketchPointStyle(sketch.getGeometry().getCoordinates())
        case 'Polygon': {
            const styles = [
                new Style({
                    stroke: displayMeasures ? dashedRedStroke : redStroke,
                    geometry: sketch.get('geodesic')?.getGeodesicGeom(),
                    zIndex: 20,
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
                        zIndex: 0,
                    })
                )
            }
            return styles
        }
    }
}
