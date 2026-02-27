import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { Coordinate } from 'ol/coordinate'
import type { FeatureLike } from 'ol/Feature'
import type { Geometry } from 'ol/geom'
import type { GeometryFunction } from 'ol/style/Style'

import { featuresAPI } from '@swissgeo/api'
import { featureStyleUtils } from '@swissgeo/api/utils'
import { LV95, WGS84 } from '@swissgeo/coordinates'
import { format } from '@swissgeo/numbers'
import { styleUtils } from '@swissgeo/theme'
import { bearing, length as totalLength, lineString, polygon } from '@turf/turf'
import { Circle as CircleGeometry, LineString, MultiPoint, Point, Polygon } from 'ol/geom'
import RenderFeature from 'ol/render/Feature'
import { Circle, Fill, Stroke, Style, Text } from 'ol/style'
import proj4 from 'proj4'

function getTooltipTextBox(text: string) {
    return new Text({
        text: text,
        font: 'normal 12px Helvetica',
        fill: new Fill({
            color: '#ffffff',
        }),
        stroke: styleUtils.redStroke,
        backgroundFill: styleUtils.redFill,
        // This background stroke is used to round the corners of the tooltip box
        backgroundStroke: new Stroke({
            color: [255, 0, 0, 0.9],
            width: 7,
            lineCap: 'round',
            lineJoin: 'round',
        }),
        /* These padding values in the format [top, right, bottom, left] should approximately
        center the text in the tooltip box */
        padding: [2, 2.5, -1, 4],
        scale: 1,
        offsetY: -18,
    })
}

/**
 * Format distance or ara in a readable format
 *
 * @returns Distance/area formatted (e.g. 1000 => '1 km')
 */
export function formatMeters(value: number, useSquareUnits = false): string {
    const factor = Math.pow(1000, useSquareUnits ? 2 : 1)
    let unit = useSquareUnits ? 'm²' : 'm'
    if (value >= factor) {
        unit = useSquareUnits ? 'km²' : 'km'
        value /= factor
    }
    return `${format(value)} ${unit}`
}

/**
 * Style function as used by the Modify Interaction. Used to display a translucent point on a line
 * when hovering it to indicate that the user can grab the line to create a new point.
 */
export function editingVertexStyleFunction(
    vertex: FeatureLike,
    _resolution: number
): Style | Style[] | null {
    const associatedFeature = vertex.get('features')[0]
    const editableFeature = associatedFeature?.get('editableFeature')
    if (!associatedFeature || (editableFeature && featuresAPI.isLineOrMeasure(editableFeature))) {
        return null
    }
    return new Style({
        image: styleUtils.sketchPointStyle,
    })
}

const addingGrabbingPoint: GeometryFunction = (
    feature: FeatureLike
): RenderFeature | Geometry | undefined => {
    const geometry = feature.getGeometry()
    if (!geometry || geometry instanceof RenderFeature) {
        return
    }
    let coordinates: Coordinate[] | undefined
    if (geometry.getType() === 'Polygon') {
        coordinates = (geometry as Polygon).getCoordinates()[0]
    } else if (geometry.getType() === 'LineString') {
        coordinates = (geometry as LineString).getCoordinates()
    }
    if (!coordinates) {
        return
    }
    return new MultiPoint(coordinates)
}

/**
 * Style function (as OpenLayers needs it) that will style features while they are being drawn or
 * edited by our drawing module.
 *
 * Note that the style differs when the feature is selected (or drawn for the first time) or when
 * displayed without interaction (see {@link geoadminStyleFunction} for this case)
 */
export function editingFeatureStyleFunction(
    feature: FeatureLike,
    resolution: number
): Style | Style[] | null {
    /* This style (image tag) will only be shown for point geometries. So this style will display
    the white dot when selecting a symbol or text feature. */
    const styles = [
        new Style({
            image: styleUtils.whiteCircleStyle,
            zIndex: styleUtils.StyleZIndex.WhiteDot,
        }),
    ]
    const geom = feature.getGeometry()
    if (geom instanceof Polygon || geom instanceof LineString) {
        // adding grabbing points at each edge so that the user can grab them and
        // modify the shape of the features (functionality is handled by the modify interaction,
        // this only adds the visual indicators so the user understands that the edges are
        // grabable.)
        styles.push(
            new Style({
                image: styleUtils.whiteCircleStyle,
                geometry: addingGrabbingPoint,
                zIndex: styleUtils.StyleZIndex.WhiteDot,
            })
        )
    }
    const defStyle = featureStyleUtils.geoadminStyleFunction(feature, resolution)
    if (Array.isArray(defStyle)) {
        styles.push(...defStyle)
    } else if (defStyle) {
        styles.push(defStyle)
    }
    return styles
}

/** Return a sketch Point Style */
export function getSketchPointStyle(coordinate: Coordinate): Style {
    return new Style({
        geometry: new Point(coordinate),
        image: new Circle({
            radius: 4,
            fill: new Fill({
                color: [255, 0, 0, 0.4],
            }),
            stroke: styleUtils.redStroke,
        }),
        zIndex: styleUtils.StyleZIndex.WhiteDot,
    })
}

export function getSketchLineStyle(
    geometry: LineString,
    isMeasuring: boolean,
    drawingProjection: CoordinateSystem = LV95
): Style[] {
    const styles: Style[] = []

    styles.push(
        new Style({
            geometry,
            stroke: isMeasuring ? styleUtils.dashedRedStroke : styleUtils.redStroke,
            zIndex: styleUtils.StyleZIndex.Line,
        })
    )

    let turfGeometryEquivalent
    let reprojectedCoordinates: Coordinate[] = []
    if (geometry.getType() === 'LineString') {
        reprojectedCoordinates = geometry
            .getCoordinates()
            .map((coordinate) => proj4(drawingProjection.epsg, WGS84.epsg, coordinate))
        turfGeometryEquivalent = lineString(reprojectedCoordinates)
    } else {
        reprojectedCoordinates = geometry
            .getCoordinates()
            .map((coordinate) => proj4(drawingProjection.epsg, WGS84.epsg, coordinate))
        turfGeometryEquivalent = polygon([reprojectedCoordinates])
    }

    const geometryLength = totalLength(turfGeometryEquivalent, {
        units: 'meters',
    })

    if (isMeasuring) {
        // Azimuth circle
        if (geometry.getCoordinates().length === 2) {
            const circleGeom = new CircleGeometry(geometry.getCoordinates()[0]!, geometryLength)
            styles.push(
                new Style({
                    stroke: styleUtils.redStrokeSubtle,
                    geometry: circleGeom,
                    zIndex: styleUtils.StyleZIndex.AzimuthCircle,
                })
            )
        }

        // Total length tooltip
        let lengthText = formatMeters(geometryLength)
        if (geometry.getCoordinates().length === 2) {
            let angle = bearing(reprojectedCoordinates[0]!, reprojectedCoordinates[1]!)
            if (angle < 0) {
                angle += 360
            }
            lengthText = `${angle.toFixed(2)}° / ${lengthText}`
        }
        styles.push(
            new Style({
                image: styleUtils.tooltipArrow,
                text: getTooltipTextBox(lengthText),
                // showing the tooltip over the last point of the geometry
                geometry: new Point(geometry.getLastCoordinate()),
                zIndex: styleUtils.StyleZIndex.Tooltip,
            })
        )
    }

    styles.push(...geometry.getCoordinates().map((coordinate) => getSketchPointStyle(coordinate)))

    return styles
}

/**
 * This is the styling function used by the draw interaction when drawing a line. See the doc of
 * "drawMeasureStyle" for more information about how this function is invoked.
 */
export function drawLineStyle(sketch: FeatureLike, resolution: number): Style | Style[] | null {
    return drawLineOrMeasureStyle(sketch, resolution, false)
}

/**
 * This is the styling function used by the draw interaction when drawing a measure.
 *
 * Note that the draw interaction passes three different types of features to this interaction. The
 * actual feature being drawn (in our case a polygon), a Linestring (connecting all points already
 * drawn) and a point for the last point drawn. The two helping features (linestring and point) are
 * automatically deleted when the drawing is finished.
 */
export function drawMeasureStyle(sketch: FeatureLike, resolution: number): Style | Style[] | null {
    return drawLineOrMeasureStyle(sketch, resolution, true)
}

export function drawLineOrMeasureStyle(
    sketch: FeatureLike,
    resolution: number,
    displayMeasures: boolean
): Style | Style[] | null {
    const sketchGeometry = sketch.getGeometry()
    if (!sketchGeometry) {
        return null
    }
    const type = sketchGeometry.getType()
    switch (type) {
        case 'Point':
            return getSketchPointStyle((sketchGeometry as Point).getCoordinates())
        case 'LineString':
            return getSketchLineStyle(sketchGeometry as LineString, displayMeasures)
        case 'Polygon': {
            const polygonGeom = sketchGeometry as Polygon
            // lines are drawn as polygon, so both types are covered by this case
            const styles = [
                new Style({
                    geometry: polygonGeom,
                    stroke: displayMeasures ? styleUtils.dashedRedStroke : styleUtils.redStroke,
                    zIndex: styleUtils.StyleZIndex.Line,
                }),
            ]
            if (displayMeasures) {
                const points = polygonGeom.getCoordinates()[0]!
                if (points.length <= 2) {
                    styles.push(
                        new Style({
                            stroke: styleUtils.redStroke,
                            geometry: polygonGeom,
                            zIndex: styleUtils.StyleZIndex.AzimuthCircle,
                        })
                    )
                }
                // TODO: fixme
                // styles.push(...sketch.get('geodesic').getMeasureStyles(resolution))
            }
            if (polygonGeom) {
                styles.push(
                    new Style({
                        geometry: polygonGeom,
                        fill: styleUtils.whiteSketchFill,
                        zIndex: styleUtils.StyleZIndex.AzimuthCircle,
                    })
                )
            }
            return styles
        }
    }
    return null
}
