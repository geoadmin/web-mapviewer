import { canShowAzimuthCircle, getMeasureDelta, toLv95 } from '@/modules/drawing/lib/drawingUtils'
import { DrawingModes } from '@/modules/store/modules/drawing.store'
import { asArray } from 'ol/color'
import { Circle as CircleGeom, LineString, MultiPoint, Polygon } from 'ol/geom'
import GeometryType from 'ol/geom/GeometryType'
import { Circle, Fill, Icon, Stroke, Style, Text } from 'ol/style'

const whiteSketchFill = new Fill({
    color: [255, 255, 255, 0.4],
})

const redStroke = new Stroke({
    width: 3,
    color: [255, 0, 0],
})

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
const sketchPoint = new Circle({
    ...pointStyle,
    fill: whiteSketchFill,
})

export const editingFeatureStyleFunction = (feature) => {
    const featureGeometries = feature.get('geometries')
    const isLineOrMeasure = featureGeometries && featureGeometries[0] instanceof Polygon
    const styles = [
        new Style({
            image: isLineOrMeasure ? sketchPoint : point,
            zIndex: 30,
        }),
    ]
    const geom = feature.getGeometry()
    if (geom instanceof Polygon || geom instanceof LineString) {
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
    const defStyle = featureStyle(feature)
    if (defStyle) {
        styles.push(...defStyle)
    }
    return styles
}

/**
 * @param {Feature} feature
 * @returns {Style[]}
 */
export function featureStyle(feature) {
    let color = feature.get('color')
    if (!color) {
        return
    }
    color = asArray(color)
    const stroke = feature.get('strokeColor')
    const fillColor = [...color.slice(0, 3), 0.4]
    const text = feature.get('text')
    const drawingMode = feature.get('drawingMode')
    const icon = feature.get('iconUrl')
    const anchor = feature.get('anchor')
    const textScale = feature.get('textScale')
    let image = null
    if (icon) {
        // this might be expensive
        image = new Icon({
            src: icon,
            crossOrigin: 'Anonymous',
            anchor: anchor,
        })
    }
    const styles = [
        new Style({
            image: image,
            text: new Text({
                text: text,
                font: textScale.font,
                fill: new Fill({
                    color: color,
                }),
                stroke: new Stroke({
                    color: stroke ? asArray(stroke) : [255, 255, 255, 1.0],
                    width: 3,
                }),
                scale: textScale || 1,
            }),
            stroke:
                drawingMode === DrawingModes.MEASURE
                    ? dashedRedStroke
                    : new Stroke({
                          color: color,
                          width: 3,
                      }),
            fill: new Fill({
                color: fillColor,
            }),
        }),
    ]
    if (drawingMode === DrawingModes.MEASURE) {
        styles.push(azimuthCircleStyle(), measurePoints())
    }
    return styles
}

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
    if (type === GeometryType.POINT) {
        return sketchPointStyle
    } else if (type === GeometryType.LINE_STRING) {
        return sketchLineStyle
    } else if (type === GeometryType.POLYGON) {
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
