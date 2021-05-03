import { Style, Fill, Stroke, Text, Icon } from 'ol/style'
import { asArray } from 'ol/color'

export function createEditingStyle() {
    return undefined
}

/**
 * @param {Feature} feature
 * @returns {Style}
 */
export function featureStyle(feature) {
    const color = asArray(feature.get('color'))
    const fillColor = [...color.slice(0, 3), 0.4]
    const text = feature.get('text')
    const font = feature.get('font')
    const icon = feature.get('icon')
    const anchor = feature.get('anchor')
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
                color: [255, 255, 255, 1.0],
                width: 3,
            }),
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
