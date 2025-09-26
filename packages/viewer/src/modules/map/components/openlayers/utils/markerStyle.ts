import type OLFeature from 'ol/Feature'

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

export enum OpenLayersMarkerStyles {
    Balloon = 'balloon',
    Position = 'position',
    Feature = 'feature',
    Hidden = 'hidden',
    Bowl = 'bowl',
    Circle = 'circle',
    Cross = 'cross',
    Point = 'point',
}

function imageForMarkerStyle(markerStyle: OpenLayersMarkerStyles): string | undefined {
    switch (markerStyle) {
        case OpenLayersMarkerStyles.Bowl:
            return bowlImage
        case OpenLayersMarkerStyles.Balloon:
            return markerImage
        case OpenLayersMarkerStyles.Circle:
            return circleImage
        case OpenLayersMarkerStyles.Cross:
            return crossImage
        case OpenLayersMarkerStyles.Point:
            return pointImage
    }
}

export function getMarkerStyle(markerStyle: OpenLayersMarkerStyles): Style {
    switch (markerStyle) {
        case OpenLayersMarkerStyles.Position:
            return geolocationPointStyle

        case OpenLayersMarkerStyles.Balloon:
            return new Style({
                image: new IconStyle({
                    anchor: [0.5, 1],
                    src: markerImage,
                }),
            })

        case OpenLayersMarkerStyles.Bowl:
        case OpenLayersMarkerStyles.Circle:
        case OpenLayersMarkerStyles.Cross:
        case OpenLayersMarkerStyles.Point:
            return new Style({
                image: new IconStyle({
                    anchor: [0.5, 0.5],
                    src: imageForMarkerStyle(markerStyle),
                }),
            })

        case OpenLayersMarkerStyles.Feature:
            return highlightPointStyle

        case OpenLayersMarkerStyles.Hidden:
        default:
            return new Style({
                image: new IconStyle({
                    opacity: 0,
                }),
            })
    }
}

export function highlightFeatureStyle(olFeature: OLFeature): Style | undefined {
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
