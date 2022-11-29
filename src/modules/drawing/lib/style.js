import { EditableFeatureTypes } from '@/api/features.api'
import { LineString, MultiPoint, Polygon, Point } from 'ol/geom'
import { Circle, Fill, Stroke, Style, Text } from 'ol/style'
import { wrapWebmercatorCoords } from '@/modules/drawing/lib/drawingUtils'

/* Z-INDICES
The z indices for the styles are given according to the following table:
azimuth-circle/fill:       0
main style:                10
line:                      20
measure points:            21
white dot / sketch points: 30
tooltip:                   40
*/

/** Color for polygon area fill while drawing */
const whiteSketchFill = new Fill({
    color: [255, 255, 255, 0.4],
})

/** Standard line styling */
const redStroke = new Stroke({
    width: 3,
    color: [255, 0, 0],
})

/** Styling specific for measurement, with a dashed red line */
const dashedRedStroke = new Stroke({
    color: [255, 0, 0],
    width: 3,
    lineDash: [8],
})

const pointStyle = {
    radius: 7,
    stroke: new Stroke({
        color: [0, 0, 0, 1],
    }),
}
const point = new Circle({
    ...pointStyle,
    fill: new Fill({
        color: [255, 255, 255, 1],
    }),
})
/** Style for grabbing points when editing a feature */
const sketchPoint = new Circle({
    ...pointStyle,
    fill: whiteSketchFill,
})

/**
 * Style function as used by the Modify Interaction. Used to display a translucent point on a line
 * when hovering it to indicate that the user can grab the line to create a new point.
 */
export const editingVertexStyleFunction = (vertex) => {
    const associatedFeature = vertex.get('features')[0]
    if (!associatedFeature) return
    return associatedFeature.get('editableFeature').isLineOrMeasure()
        ? new Style({
              image: sketchPoint,
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
            image: point,
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
                image: point,
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
 * OpenLayers style function that will style a feature that is not currently edited but loaded in
 * the drawing layer.
 *
 * It can then be selected by the user, but this time the styling will be done by
 * {@link editingFeatureStyleFunction}
 *
 * @param {Feature} feature OpenLayers feature to style
 * @param {number} resolution The resolution of the map in map units / pixel (which is equatorial
 *   meters / pixel for the webmercator projection used in this project)
 * @returns {Style[]}
 */
export function featureStyleFunction(feature, resolution) {
    const editableFeature = feature.get('editableFeature')
    if (!editableFeature) {
        return
    }
    // Tells if we are drawing a polygon for the first time, in this case we want
    // to fill this polygon with a transparent white (instead of red)
    const isDrawing = feature.get('isDrawing')
    const styles = [
        new Style({
            geometry: feature.geodesic?.getGeodesicGeom(),
            image: editableFeature.generateOpenlayersIcon(),
            text: new Text({
                text: editableFeature.title,
                //font: editableFeature.font,
                font: `normal 16px Helvetica`,
                fill: new Fill({
                    color: editableFeature.textColor.fill,
                }),
                stroke: new Stroke({
                    color: editableFeature.textColor.border,
                    width: 3,
                }),
                scale: editableFeature.textSizeScale || 1,
            }),
            stroke:
                editableFeature.featureType === EditableFeatureTypes.MEASURE
                    ? dashedRedStroke
                    : new Stroke({
                          color: editableFeature.fillColor.fill,
                          width: 3,
                      }),
            // filling a polygon with white if first time being drawn (otherwise fallback to user set color)
            fill: isDrawing
                ? whiteSketchFill
                : new Fill({
                      color: [...editableFeature.fillColor.rgb.slice(0, 3), 0.4],
                  }),
            zIndex: 10,
        }),
    ]
    const polygonGeom = feature.geodesic?.getGeodesicPolygonGeom()
    if (polygonGeom) {
        styles.push(
            new Style({
                geometry: polygonGeom,
                fill: isDrawing
                    ? whiteSketchFill
                    : new Fill({
                          color: [...editableFeature.fillColor.rgb.slice(0, 3), 0.4],
                      }),
                zIndex: 0,
            })
        )
    }
    /* This function is also called when saving the feature to KML, where "feature.geodesic"
    is not there anymore, thats why we have to check for it here */
    if (editableFeature.featureType === EditableFeatureTypes.MEASURE && feature.geodesic) {
        styles.push(...feature.geodesic.getMeasureStyles(resolution))
    }
    return styles
}

const getSketchPointStyle = (coord) =>
    new Style({
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
            const coord = wrapWebmercatorCoords(sketch.getGeometry().getCoordinates())
            return getSketchPointStyle(coord)
        case 'Polygon':
            const styles = [
                new Style({
                    stroke: displayMeasures ? dashedRedStroke : redStroke,
                    geometry: sketch.geodesic.getGeodesicGeom(),
                    zIndex: 20,
                }),
            ]
            if (displayMeasures) {
                styles.push(...sketch.geodesic.getMeasureStyles(resolution))
            }
            const polygonGeom = sketch.geodesic?.getGeodesicPolygonGeom()
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
