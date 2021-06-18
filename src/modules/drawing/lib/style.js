import { asArray } from 'ol/color'
import { Fill, Icon, Stroke, Style, Text, Circle } from 'ol/style'
import { MultiPoint, Polygon } from 'ol/geom'

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
        fill: new Fill({
            color: [255, 255, 255, 0.4],
        }),
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
        if (feature.getGeometry() instanceof Polygon) {
            styles.push(
                new Style({
                    image: point,
                    geometry: function (feature) {
                        const coordinates = feature.getGeometry().getCoordinates()[0]
                        return new MultiPoint(coordinates)
                    },
                })
            )
        }
        const defStyle = featureStyle(feature)
        if (defStyle) {
            styles.push(defStyle)
        }
        return styles
    }
}

/**
 * @param {Feature} feature
 * @returns {Style}
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
    const font = feature.get('font')
    const icon = feature.get('icon')
    const anchor = feature.get('anchor')
    const textScale = feature.get('textScale')
    const markerScale = feature.get('markerScale') || 1
    let image = null
    if (icon) {
        // this might be expensive
        image = new Icon({
            src: icon,
            anchor: anchor,
            scale: markerScale,
        })
    }
    return new Style({
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
        stroke: new Stroke({
            color: color,
            width: 3,
        }),
        fill: new Fill({
            color: fillColor,
        }),
    })
}

export const sketchPointStyle = new Style({
    image: new Circle({
        radius: 4,
        fill: new Fill({
            color: [255, 0, 0, 0.4],
        }),
        stroke: new Stroke({
            width: 3,
            color: [255, 0, 0],
        }),
    }),
})

const sketchLineStyle = new Style({
    stroke: new Stroke({
        width: 3,
        color: [255, 0, 0],
    }),
})

const sketchPolygonStyle = new Style({
    fill: new Fill({
        color: [255, 255, 255, 0.4],
    }),
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
    // FIXME: implement this !
    return drawLineStyle(sketch)
}
