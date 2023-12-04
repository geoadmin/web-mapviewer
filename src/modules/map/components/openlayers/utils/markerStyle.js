import { Fill, Stroke, Style } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import IconStyle from 'ol/style/Icon'

import bowlImage from '@/modules/map/assets/bowl.png'
import circleImage from '@/modules/map/assets/circle.png'
import crossImage from '@/modules/map/assets/cross.png'
import markerImage from '@/modules/map/assets/marker.png'
import pointImage from '@/modules/map/assets/point.png'

// style for feature highlighting (we export it so that they can be re-used by OpenLayersHighlightedFeature)
export const highlightedFill = new Fill({
    color: [255, 255, 0, 0.75],
})
export const highlightedStroke = new Stroke({
    color: [255, 128, 0, 1],
    width: 3,
})
export const highlightPointStyle = new Style({
    image: new CircleStyle({
        radius: 10,
        fill: highlightedFill,
        stroke: highlightedStroke,
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

export function getOlStyle(markerStyle) {
    switch (markerStyle) {
        case OpenLayersMarkerStyles.POSITION:
            // style for geolocation point
            return new Style({
                image: new CircleStyle({
                    radius: 5,
                    fill: new Fill({
                        color: [255, 0, 0, 0.9],
                    }),
                    stroke: new Stroke({
                        color: [255, 255, 255, 1],
                        width: 3,
                    }),
                }),
            })

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

export function geoJsonStyleFunction(olFeature) {
    const geoJsonType = olFeature.get('geometry').getType()
    switch (geoJsonType) {
        case 'LineString':
        case 'MultiLineString':
            return new Style({
                stroke: highlightedStroke,
            })
        case 'Polygon':
        case 'MultiPolygon':
        case 'Circle':
        case 'GeometryCollection':
            return new Style({
                stroke: highlightedStroke,
                fill: highlightedFill,
            })
        case 'Point':
        case 'MultiPoint':
            return highlightPointStyle
        default:
            return null
    }
}
