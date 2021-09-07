import { asArray } from 'ol/color'
import { Fill, Icon, Stroke, Style, Text, Circle } from 'ol/style'
import { MultiPoint, Polygon, Circle as CircleGeom, LineString } from 'ol/geom'
import { canShowAzimuthCircle, getMeasureDelta, toLv95 } from '@/modules/drawing/lib/drawingUtils'

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

export function createEditingStyle() {
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
    return (feature) => {
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
                    geometry: function (f) {
                        const geometry = f.getGeometry()
                        let coordinates = geometry.getCoordinates()
                        if (geometry instanceof Polygon) coordinates = coordinates[0]
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
}

/**
 * @param {Feature} feature
 * @returns {Style[]}
 */
export function featureStyle(feature) {
    let color = feature.get('color')
    if (!color) return
    const type = feature.get('type')
    color = asArray(color)
    const stroke = feature.get('strokeColor')
    const fillColor = [...color.slice(0, 3), 0.4]
    const text = feature.get('text')
    const font = feature.get('font')
    const icon = feature.get('icon')
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
                font: font,
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
                type === 'MEASURE'
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
    if (type === 'MEASURE') {
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
        geometry: function (feature) {
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
        geometry: function (feature) {
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
