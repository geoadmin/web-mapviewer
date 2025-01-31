import { Style } from 'ol/style'
import IconStyle from 'ol/style/Icon'

import bowlImage from '@/modules/map/assets/bowl.png'
import circleImage from '@/modules/map/assets/circle.png'
import crossImage from '@/modules/map/assets/cross.png'
import markerImage from '@/modules/map/assets/marker.png'
import pointImage from '@/modules/map/assets/point.png'
import {
    geolocationPointStyle,
    highlightedLinePolygonStyle,
    highlightPointStyle,
    hoveredLinePolygonStyle,
    hoveredPointStyle,
} from '@/utils/styleUtils.js'

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
