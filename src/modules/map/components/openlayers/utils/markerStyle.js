import { Fill, Stroke, Style } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import IconStyle from 'ol/style/Icon'

import bowlImage from '@/modules/map/assets/bowl.png'
import circleImage from '@/modules/map/assets/circle.png'
import crossImage from '@/modules/map/assets/cross.png'
import markerImage from '@/modules/map/assets/marker.png'
import pointImage from '@/modules/map/assets/point.png'
import variables from '@/scss/variables-admin.module.scss'

const { red, mocassin, mocassinToRed1, mocassinToRed2, white } = variables

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

/** @enum */
export const OpenLayersMarkerStyles = {
    BALLOON: 'balloon',
    POSITION: 'position',
    FEATURE: 'feature',
    HIDDEN: 'hidden',
    BOWL: 'bowl',
    CIRCLE: 'circle',
    CROSS: 'cross',
    POINT: 'point',
}

/**
 * @param {OpenLayersMarkerStyles} markerStyle
 * @returns {Image | null}
 */
function imageForMarkerStyle(markerStyle) {
    switch (markerStyle) {
        case OpenLayersMarkerStyles.BOWL:
            return bowlImage
        case OpenLayersMarkerStyles.BALLOON:
            return markerImage
        case OpenLayersMarkerStyles.CIRCLE:
            return circleImage
        case OpenLayersMarkerStyles.CROSS:
            return crossImage
        case OpenLayersMarkerStyles.POINT:
            return pointImage
    }
    return null
}

export function getMarkerStyle(markerStyle) {
    switch (markerStyle) {
        case OpenLayersMarkerStyles.POSITION:
            return geolocationPointStyle

        case OpenLayersMarkerStyles.BALLOON:
            return new Style({
                image: new IconStyle({
                    anchor: [0.5, 1],
                    src: markerImage,
                }),
            })

        case OpenLayersMarkerStyles.BOWL:
        case OpenLayersMarkerStyles.CIRCLE:
        case OpenLayersMarkerStyles.CROSS:
        case OpenLayersMarkerStyles.POINT:
            return new Style({
                image: new IconStyle({
                    anchor: [0.5, 0.5],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    src: imageForMarkerStyle(markerStyle),
                }),
            })

        case OpenLayersMarkerStyles.FEATURE:
            return highlightPointStyle

        case OpenLayersMarkerStyles.HIDDEN:
        default:
            return new Style({
                visible: false,
            })
    }
}

export function highlightFeatureStyle(olFeature) {
    const geometryType = olFeature.get('geometry').getType()
    const isHovered = !!olFeature.get('isHovered')
    switch (geometryType) {
        case 'LineString':
        case 'MultiLineString':
        case 'Polygon':
        case 'MultiPolygon':
        case 'Circle':
        case 'GeometryCollection':
            return isHovered ? hoveredLinePolygonStyle : highlightedLinePolygonStyle
        case 'Point':
        case 'MultiPoint':
            return isHovered ? hoveredPointStyle : highlightPointStyle
        default:
            return null
    }
}
