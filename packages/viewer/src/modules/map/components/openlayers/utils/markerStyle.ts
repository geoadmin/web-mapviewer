import type { StyleFunction } from 'ol/style/Style'

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
} from '@/utils/styleUtils'

export type OpenLayersMarkerStyles =
    | 'balloon'
    | 'position'
    | 'feature'
    | 'hidden'
    | 'bowl'
    | 'circle'
    | 'cross'
    | 'point'

function imageForMarkerStyle(markerStyle: OpenLayersMarkerStyles): string | undefined {
    switch (markerStyle) {
        case 'bowl':
            return bowlImage
        case 'balloon':
            return markerImage
        case 'circle':
            return circleImage
        case 'cross':
            return crossImage
        case 'point':
            return pointImage
    }
}

export function getMarkerStyle(markerStyle: OpenLayersMarkerStyles): Style {
    switch (markerStyle) {
        case 'position':
            return geolocationPointStyle

        case 'balloon':
            return new Style({
                image: new IconStyle({
                    anchor: [0.5, 1],
                    src: markerImage,
                }),
            })

        case 'bowl':
        case 'circle':
        case 'cross':
        case 'point':
            return new Style({
                image: new IconStyle({
                    anchor: [0.5, 0.5],
                    src: imageForMarkerStyle(markerStyle),
                }),
            })

        case 'feature':
            return highlightPointStyle

        case 'hidden':
        default:
            return new Style({
                image: new IconStyle({
                    opacity: 0,
                }),
            })
    }
}

export const highlightFeatureStyle: StyleFunction = (olFeature, _resolution) => {
    if (!olFeature) {
        return
    }
    const geometryType = olFeature.getGeometry()?.getType()
    const isHovered = !!olFeature.get('isHovered')
    const isCurrentSegment = !!olFeature.get('isCurrentSegment')
    switch (geometryType) {
        case 'LineString':
        case 'MultiLineString':
        case 'Polygon':
        case 'MultiPolygon':
        case 'Circle':
        case 'GeometryCollection':
            return isHovered || isCurrentSegment
                ? hoveredLinePolygonStyle
                : highlightedLinePolygonStyle
        case 'Point':
        case 'MultiPoint':
            return isHovered || isCurrentSegment ? hoveredPointStyle : highlightPointStyle
        default:
            return
    }
}
