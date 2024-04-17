import { Circle, Fill, Stroke, Style } from 'ol/style'
import CircleStyle from 'ol/style/Circle.js'

import variables from '@/scss/variables-admin.module.scss'

const { red, mocassin, mocassinToRed1, mocassinToRed2, malibu, black, white } = variables

// OL needs color as RGBA arrays, so we convert them through this function
function hexToRgba(hexValue, alpha = 1.0) {
    return [
        ...hexValue
            .replaceAll('#', '')
            .match(/.{1,2}/g)
            .map((value) => parseInt(value, 16)),
        alpha,
    ]
}

export const whiteSketchFill = new Fill({
    color: hexToRgba(white, 0.4),
})

export const redFill = new Fill({
    color: hexToRgba(red, 0.7),
})
/** Standard line styling */
export const redStroke = new Stroke({
    width: 3,
    color: hexToRgba(red),
})

export const malibuStroke = new Stroke({
    width: 3,
    color: hexToRgba(malibu),
})

/** Styling specific for measurement, with a dashed red line */
export const dashedRedStroke = new Stroke({
    color: hexToRgba(red),
    width: 3,
    lineDash: [8],
})

export const pointStyle = {
    radius: 7,
    stroke: new Stroke({
        color: hexToRgba(black),
    }),
}
export const circleStyle = new Circle({
    ...pointStyle,
    fill: new Fill({
        color: hexToRgba(red),
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

export const gpxStyles = {
    Point: new Style({ image: circleStyle }),
    LineString: new Style({ stroke: redStroke, fill: redFill }),
    MultiLineString: new Style({ stroke: redStroke, fill: redFill }),
}

export const geolocationPointStyle = new Style({
    image: new CircleStyle({
        radius: 15,
        fill: new Fill({
            color: hexToRgba(red, 0.9),
        }),
        stroke: new Stroke({
            color: hexToRgba(white, 1.0),
            width: 3,
        }),
    }),
})

export const selectionBoxStyle = new Style({
    stroke: redStroke,
})

// style for feature highlighting (we export it so that they can be re-used by OpenLayersHighlightedFeature)
export const highlightedFill = new Fill({
    color: hexToRgba(mocassin, 0.6),
})
export const highlightedStroke = new Stroke({
    color: hexToRgba(mocassinToRed2, 1.0),
    width: 3,
})

export const hoveredFill = new Fill({
    color: hexToRgba(mocassinToRed1, 0.8),
})
export const hoveredStroke = new Stroke({
    color: hexToRgba(red, 1.0),
    width: 3,
})

export const hoveredLinePolygonStyle = new Style({
    fill: hoveredFill,
    stroke: hoveredStroke,
    // always on top (in case there's an overlap with another selected feature)
    zIndex: 9999,
})
export const hoveredPointStyle = new Style({
    image: new CircleStyle({
        radius: 10,
        fill: hoveredFill,
        stroke: hoveredStroke,
    }),
    // always on top (in case there's an overlap with another selected feature)
    zIndex: 9999,
})
export const highlightedLinePolygonStyle = new Style({
    fill: highlightedFill,
    stroke: highlightedStroke,
})
export const highlightPointStyle = new Style({
    image: new CircleStyle({
        radius: 10,
        fill: highlightedFill,
        stroke: highlightedStroke,
    }),
})
