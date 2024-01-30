import { Circle, Fill, Stroke, Style } from 'ol/style.js'

export const whiteSketchFill = new Fill({
    color: [255, 255, 255, 0.4],
})

export const redFill = new Fill({
    color: [255, 0, 0, 0.7],
})
/** Standard line styling */
export const redStroke = new Stroke({
    width: 3,
    color: [255, 0, 0],
})

/** Styling specific for measurement, with a dashed red line */
export const dashedRedStroke = new Stroke({
    color: [255, 0, 0],
    width: 3,
    lineDash: [8],
})

export const pointStyle = {
    radius: 7,
    stroke: new Stroke({
        color: [0, 0, 0, 1],
    }),
}
export const circleStyle = new Circle({
    ...pointStyle,
    fill: new Fill({
        color: [255, 255, 255, 1],
    }),
})
/** Style for grabbing points when editing a feature */
export const sketchPointStyle = new Circle({
    ...pointStyle,
    fill: whiteSketchFill,
})
export const gpxStyle = new Style({
    fill: redFill,
    stroke: redStroke,
    image: circleStyle,
})
