import { Circle, Fill, Stroke, Style } from 'ol/style'
import CircleStyle from 'ol/style/Circle.js'

import { PRINT_DPI_COMPENSATION } from '@/config/print.config'
import variables from '@/scss/variables-admin.module.scss'
import { MIN_PRINT_SCALE_SIZE } from '@/api/print.api'

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

export const gpxStrokeStyle = new Stroke({ width: 1.5, color: hexToRgba(red, 1) })

export const pointStyle = {
    radius: 7,
    stroke: new Stroke({
        color: hexToRgba(black),
    }),
}
export const whiteCircleStyle = new Circle({
    ...pointStyle,
    fill: new Fill({
        color: hexToRgba(white),
    }),
})

export const redCircleStyle = new Circle({
    ...pointStyle,
    fill: new Fill({
        color: hexToRgba(red),
    }),
    stroke: gpxStrokeStyle,
})
/** Style for grabbing points when editing a feature */
export const sketchPointStyle = new Circle({
    ...pointStyle,
    fill: whiteSketchFill,
})

export const gpxStyles = {
    Point: new Style({ image: redCircleStyle }),
    LineString: new Style({ stroke: gpxStrokeStyle, fill: redFill }),
    MultiLineString: new Style({ stroke: gpxStrokeStyle, fill: redFill }),
}

export const geolocationPointWidth = 10
export const geolocationPointFillColor = hexToRgba(red, 0.9)
export const geolocationPointBorderWidth = 3
export const geolocationPointBorderColor = hexToRgba(white, 1.0)

export const geolocationPointStyle = new Style({
    image: new CircleStyle({
        radius: geolocationPointWidth,
        fill: new Fill({
            color: geolocationPointFillColor,
        }),
        stroke: new Stroke({
            color: geolocationPointBorderColor,
            width: geolocationPointBorderWidth,
        }),
    }),
})

export const geolocationAccuracyCircleFillColor = hexToRgba(red, 0.1)
export const geolocationAccuracyCircleBorderWidth = geolocationPointBorderWidth
export const geolocationAccuracyCircleBorderColor = hexToRgba(red, 0.9)

export const geolocationAccuracyCircleStyle = new Style({
    fill: new Fill({
        color: geolocationAccuracyCircleFillColor,
    }),
    stroke: new Stroke({
        color: geolocationAccuracyCircleBorderColor,
        width: geolocationAccuracyCircleBorderWidth,
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

// Change a width according to the change of DPI (from the old geoadmin)
// Originally introduced here https://github.com/geoadmin/mf-geoadmin3/pull/3280
export function adjustWidth(width, dpi) {
    if (!width || isNaN(width) || width <= 0 || !dpi || isNaN(dpi) || dpi <= 0) {
        return 0
    }

    return Math.max((width * PRINT_DPI_COMPENSATION) / dpi, MIN_PRINT_SCALE_SIZE)
}
