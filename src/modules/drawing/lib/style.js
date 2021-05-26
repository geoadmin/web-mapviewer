import { asArray } from 'ol/color'
import { Fill, Icon, Stroke, Style, Text } from 'ol/style'

export function createEditingStyle() {
    return undefined
}

/**
 * @param {Feature} feature
 * @returns {Style}
 */
export function featureStyle(feature) {
    const color = asArray(feature.get('color'))
    const stroke = feature.get('strokeColor')
    const fillColor = [...color.slice(0, 3), 0.4]
    const text = feature.get('text')
    const font = feature.get('font')
    const icon = feature.get('icon')
    const anchor = feature.get('anchor')
    const textScale = feature.get('textScale')
    let image = null
    if (icon) {
        image = new Icon({
            src: icon,
            anchor: anchor,
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
