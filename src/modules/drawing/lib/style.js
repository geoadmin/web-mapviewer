import { canShowAzimuthCircle, getMeasureDelta, toLv95 } from '@/modules/drawing/lib/drawingUtils'
import { DrawingModes } from '@/store/modules/drawing.store'
import { MEDIUM } from '@/utils/featureStyleUtils'
import { asArray } from 'ol/color'
import { Circle as CircleGeom, LineString, MultiPoint, Polygon } from 'ol/geom'
import { Circle, Fill, Icon, Stroke, Style, Text } from 'ol/style'

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
 * Style function (as OpenLayers needs it) that will style features while they are being drawn or
 * edited by our drawing module.
 *
 * Note that the style differs when the feature is selected (or drawn for the first time) or when
 * displayed without interaction (see {@link featureStyleFunction} for this case)
 */
//export const editingFeatureStyleFunction = featureStyleFunction
export const editingFeatureStyleFunction = (feature) => {
    const isLineOrMeasure = feature.get('type') === 'Polygon'
    const styles = [
        new Style({
            image: isLineOrMeasure ? sketchPoint : point,
            zIndex: 30,
        }),
    ]
    const geom = feature.getGeometry()
    if (geom instanceof Polygon || geom instanceof LineString) {
        // adding grabbing points at each edge so that the user can grab them and
        // modify the shape of the features
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
    const defStyle = featureStyleFunction(feature)
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
 * @returns {Style[]}
 */
export function featureStyleFunction(feature) {
    const editableFeature = feature.get('editableFeature')
    if (!editableFeature) {
        return
    }
    if (editableFeature.featureType === DrawingModes.MEASURE) {
        return drawMeasureStyle(feature)
    }
    // Tells if we are drawing a polygon for the first time, in this case we want
    // to fill this polygon with a transparent white (instead of red)
    const isDrawing = feature.get('isDrawing')
    const styles = [
        new Style({
            image: editableFeature.generateOpenlayersIcon(),
            text: new Text({
                text: editableFeature.title,
                font: editableFeature.font,
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
                editableFeature.featureType === DrawingModes.MEASURE
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
        }),
    ]
    if (editableFeature.featureType === DrawingModes.MEASURE) {
        styles.push(azimuthCircleStyle(), measurePoints())
    }
    return styles
}

/**
 * Style mainly used to show the position of the profile on the line (when the user hovers over a
 * portion of the profile, the position on the map is shown this way)
 */
export const sketchPointStyle = new Style({
    image: new Circle({
        radius: 4,
        fill: new Fill({
            color: [255, 0, 0, 0.4],
        }),
        stroke: redStroke,
    }),
})

const sketchLineStyle = new Style({
    stroke: redStroke,
})

const sketchPolygonStyle = new Style({
    fill: whiteSketchFill,
})

export function drawLineStyle(sketch) {
    const type = sketch.getGeometry().getType()
    if (type === 'Point') {
        return sketchPointStyle
    } else if (type === 'LineString') {
        return sketchLineStyle
    } else if (type === 'Polygon') {
        return sketchPolygonStyle
    }
}

export function drawMeasureStyle(sketch) {
    const type = sketch.getGeometry().getType()
    if (type === 'Point') {
        return sketchPointStyle
    }
    const style = {
        zIndex: type === 'LineString' ? 20 : 10,
    }
    if (type === 'LineString') {
        style.stroke = dashedRedStroke
    }
    if (type === 'Polygon') {
        style.fill = whiteSketchFill
    }
    return [new Style(style), azimuthCircleStyle(), measurePoints(true)]
}

export function azimuthCircleStyle() {
    return new Style({
        stroke: redStroke,
        geometry(feature) {
            let lineString = feature.getGeometry()
            if (canShowAzimuthCircle(lineString)) {
                const coords = lineString.getCoordinates()
                return new CircleGeom(coords[0], lineString.getLength())
            }
        },
        zIndex: 0,
    })
}

export function measurePoints(isDrawing) {
    return new Style({
        image: new Circle({
            radius: 4,
            fill: new Fill({
                color: [255, 0, 0, 1],
            }),
        }),
        geometry(feature) {
            let geom = feature.getGeometry()
            if (geom instanceof Polygon) {
                let coords = geom.getCoordinates()[0]
                if (isDrawing) {
                    coords = coords.slice(0, -1)
                }
                geom = new LineString(coords)
            }
            const coordinatesLv95 = toLv95(geom.getCoordinates(), 'EPSG:3857')
            const coordinates = []
            const length = new LineString(coordinatesLv95).getLength()
            const delta = getMeasureDelta(length)
            for (let i = delta; i < 1; i += delta) {
                coordinates.push(geom.getCoordinateAt(i))
            }
            return new MultiPoint(coordinates)
        },
        zIndex: 20,
    })
}
