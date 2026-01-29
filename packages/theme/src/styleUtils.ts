import type { Type as GeometryType } from 'ol/geom/Geometry'
import type { StyleLike } from 'ol/style/Style'

import { Circle, Fill, RegularShape, Stroke, Style } from 'ol/style'

import colors from '@/colors'

const { red, mocassin, mocassinToRed1, mocassinToRed2, malibu, black, white } = colors

const StyleZIndex = {
    AzimuthCircle: 0,
    MainStyle: 10,
    Line: 20,
    MeasurePoint: 21,
    WhiteDot: 30,
    Tooltip: 40,
    OnTop: 9999,
}

// OL needs color as RGBA arrays, so we convert them through this function
function hexToRgba(hexValue: string, alpha: number = 1.0): number[] {
    // Remove the leading # and expand 3-character hex to 6-character
    let hex = hexValue.replace(/^#/, '')
    if (hex.length === 3) {
        hex = hex
            .split('')
            .map((c) => c + c)
            .join('')
    }
    const match = hex.match(/.{1,2}/g)
    if (match) {
        return [...match.map((value) => parseInt(value, 16)), alpha]
    }
    return []
}

const STROKE_WIDTH = 3

const whiteSketchFill = new Fill({
    color: hexToRgba(white, 0.4),
})

const redFill = new Fill({
    color: hexToRgba(red, 0.7),
})
/** Standard line styling */
const redStroke = new Stroke({
    width: STROKE_WIDTH,
    color: hexToRgba(red),
})

const malibuStroke = new Stroke({
    width: STROKE_WIDTH,
    color: hexToRgba(malibu),
})

/** Styling specific for measurement, with a dashed red line */
const dashedRedStroke = new Stroke({
    color: hexToRgba(red),
    width: STROKE_WIDTH,
    lineDash: [8],
})

const gpxStrokeStyle = new Stroke({ width: STROKE_WIDTH, color: hexToRgba(red, 1) })

const pointStyle = {
    radius: 7,
    stroke: new Stroke({
        color: hexToRgba(black),
    }),
}
const whiteCircleStyle = new Circle({
    ...pointStyle,
    fill: new Fill({
        color: hexToRgba(white),
    }),
})

const redCircleStyle = new Circle({
    ...pointStyle,
    fill: new Fill({
        color: hexToRgba(red),
    }),
    stroke: gpxStrokeStyle,
})
/** Style for grabbing points when editing a feature */
const sketchPointStyle = new Circle({
    ...pointStyle,
    fill: whiteSketchFill,
})

const tooltipArrow = new RegularShape({
    points: 4,
    radius: 10,
    fill: new Fill({
        color: hexToRgba(red, 0.9),
    }),
    displacement: [0, 10],
})

const gpxPointStyle = new Style({ image: redCircleStyle })
const gpxLineStyle = new Style({ stroke: gpxStrokeStyle, fill: redFill })

const gpxStyles: Record<GeometryType, StyleLike | undefined> = {
    Circle: gpxPointStyle,
    GeometryCollection: undefined,
    LineString: gpxLineStyle,
    LinearRing: undefined,
    Point: gpxPointStyle,
    MultiLineString: gpxLineStyle,
    MultiPoint: gpxPointStyle,
    MultiPolygon: gpxLineStyle,
    Polygon: gpxLineStyle,
}

const geolocationPointWidth = 10
const geolocationPointFillColor = hexToRgba(red, 0.9)
const geolocationPointBorderWidth = STROKE_WIDTH
const geolocationPointBorderColor = hexToRgba(white, 1.0)

const geolocationPointStyle = new Style({
    image: new Circle({
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

const geolocationAccuracyCircleFillColor = hexToRgba(red, 0.1)
const geolocationAccuracyCircleBorderWidth = geolocationPointBorderWidth
const geolocationAccuracyCircleBorderColor = hexToRgba(red, 0.9)

const geolocationAccuracyCircleStyle = new Style({
    fill: new Fill({
        color: geolocationAccuracyCircleFillColor,
    }),
    stroke: new Stroke({
        color: geolocationAccuracyCircleBorderColor,
        width: geolocationAccuracyCircleBorderWidth,
    }),
})

// style for feature highlighting (we export it so that they can be re-used by OpenLayersHighlightedFeature)
const highlightedFill = new Fill({
    color: hexToRgba(mocassin, 0.6),
})
const highlightedStroke = new Stroke({
    color: hexToRgba(mocassinToRed2, 1.0),
    width: STROKE_WIDTH,
})

const hoveredFill = new Fill({
    color: hexToRgba(mocassinToRed1, 0.8),
})
const hoveredStroke = new Stroke({
    color: hexToRgba(red, 1.0),
    width: STROKE_WIDTH,
})

const hoveredLinePolygonStyle = new Style({
    fill: hoveredFill,
    stroke: hoveredStroke,
    // always on top (in case there's an overlap with another selected feature)
    zIndex: StyleZIndex.OnTop,
})
const hoveredPointStyle = new Style({
    image: new Circle({
        radius: 10,
        fill: hoveredFill,
        stroke: hoveredStroke,
    }),
    // always on top (in case there's an overlap with another selected feature)
    zIndex: StyleZIndex.OnTop,
})
const highlightedLinePolygonStyle = new Style({
    fill: highlightedFill,
    stroke: highlightedStroke,
})
const highlightPointStyle = new Style({
    image: new Circle({
        radius: 10,
        fill: highlightedFill,
        stroke: highlightedStroke,
    }),
})

export const styleUtils = {
    hexToRgba,
    StyleZIndex,
    whiteSketchFill,
    redFill,
    redStroke,
    malibuStroke,
    dashedRedStroke,
    gpxStrokeStyle,
    pointStyle,
    whiteCircleStyle,
    redCircleStyle,
    sketchPointStyle,
    tooltipArrow,
    gpxStyles,
    geolocationPointWidth,
    geolocationPointFillColor,
    geolocationPointBorderWidth,
    geolocationPointBorderColor,
    geolocationPointStyle,
    geolocationAccuracyCircleFillColor,
    geolocationAccuracyCircleBorderWidth,
    geolocationAccuracyCircleBorderColor,
    geolocationAccuracyCircleStyle,
    highlightedFill,
    highlightedStroke,
    hoveredFill,
    hoveredStroke,
    hoveredLinePolygonStyle,
    hoveredPointStyle,
    highlightedLinePolygonStyle,
    highlightPointStyle,
}
export default styleUtils
