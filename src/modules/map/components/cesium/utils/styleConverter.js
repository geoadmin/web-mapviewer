import {
    BillboardGraphics,
    Cartesian2,
    Color,
    HeightReference,
    LabelGraphics,
    NearFarScalar,
} from 'cesium'
import { DEVICE_PIXEL_RATIO } from 'ol/has'

import { CAMERA_MAX_ZOOM_DISTANCE, CAMERA_MIN_ZOOM_DISTANCE } from '@/config/cesium.config'
import { getOlImageStyleForShape } from '@/modules/map/components/openlayers/utils/styleFromLiterals'
import log from '@/utils/logging'

function getProcessedEntityLabelTemplate(entity, style) {
    const template = style?.label?.template
    if (template && entity.properties.propertyNames.length > 0) {
        let processedTemplate = template
        entity.properties.propertyNames.forEach((prop) => {
            processedTemplate = processedTemplate.replace(
                `$\{${prop}}`,
                entity.properties[prop].getValue()
            )
        })
        return processedTemplate
    }
    return null
}

function getEntityKeyValue(entity, geoJsonStyle) {
    const styleKey = geoJsonStyle.property
    return entity.properties[styleKey]?.getValue()
}

function getStyleForEntity(entity, geoJsonStyle) {
    const entityKeyValue = getEntityKeyValue(entity, geoJsonStyle)
    const keyType = geoJsonStyle.type
    if (entityKeyValue !== null) {
        if (keyType === 'range') {
            return geoJsonStyle.ranges
                .filter(
                    (range) => range.range[0] <= entityKeyValue && range.range[1] > entityKeyValue
                )
                .reduce((previous, current) => {
                    if (!previous) {
                        return current
                    } else if (
                        !previous.maxResolution ||
                        previous.maxResolution > current.maxResolution
                    ) {
                        return current
                    }
                    return previous
                }, null)
        } else if (keyType === 'unique') {
            return geoJsonStyle.values.find((value) => {
                // totally assumed double equal sign, there is sometimes type difference between GeoJSON entity
                // and the style (style has a number, entity has a "numerical" string value)
                return value.value == entityKeyValue
            })
        } else {
            log.error('[Cesium] Unknown/unimplemented type of GeoJSON style', keyType)
        }
    } else {
        log.debug('[Cesium] Entity key value not found', entity)
    }
    return null
}

/**
 * @param {Entity} entity
 * @param {Object} geoJsonStyle
 * @param {Number} opacity
 */
export function setEntityStyle(entity, geoJsonStyle, opacity = 1.0) {
    const style = getStyleForEntity(entity, geoJsonStyle)
    if (style) {
        const { vectorOptions } = style
        if (style.geomType === 'point') {
            const graphicsOptions = {
                heightReference: HeightReference.RELATIVE_TO_GROUND,
                // disabling depth test
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                ...vectorOptions,
            }
            // Here we use our OL style generator to extract the HTMLCanvas of an image (we already
            // deal with all the possibilities of our style JSON here)
            const olIcon = getOlImageStyleForShape(vectorOptions)
            if (olIcon) {
                entity.billboard = new BillboardGraphics({
                    ...graphicsOptions,
                    image: olIcon.getImage(DEVICE_PIXEL_RATIO),
                    color: Color.WHITE.withAlpha(opacity),
                })
            }
        } else {
            log.debug('[Cesium] geometry type not yet implemented', style)
        }
        if (vectorOptions.label) {
            const labelGraphicsOptions = {
                heightReference: HeightReference.RELATIVE_TO_GROUND,
                // no clipping with the terrain
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                text: getProcessedEntityLabelTemplate(entity, vectorOptions),
            }
            if (vectorOptions.label.text) {
                labelGraphicsOptions.font = vectorOptions.label.text.font
            }
            if (vectorOptions.label.text.fill) {
                labelGraphicsOptions.fill = Color.fromCssColorString(
                    vectorOptions.label.text.fill.color
                ).withAlpha(opacity)
            }
            if (vectorOptions.label.text.stroke) {
                labelGraphicsOptions.outlineColor = Color.fromCssColorString(
                    vectorOptions.label.text.stroke.color
                ).withAlpha(opacity)
                labelGraphicsOptions.outlineWidth = vectorOptions.label.text.stroke.width
            }
            if (vectorOptions.label.text.backgroundFill) {
                labelGraphicsOptions.showBackground = true
                labelGraphicsOptions.backgroundColor = Color.fromCssColorString(
                    vectorOptions.label.text.backgroundFill.color
                ).withAlpha(opacity)
            }
            if (vectorOptions.label.text.offsetY) {
                labelGraphicsOptions.pixelOffset = new Cartesian2(
                    0,
                    vectorOptions.label.text.offsetY
                )
                labelGraphicsOptions.pixelOffsetScaleByDistance = new NearFarScalar(
                    CAMERA_MIN_ZOOM_DISTANCE,
                    1.0,
                    CAMERA_MAX_ZOOM_DISTANCE / 2.0,
                    // increasing offset to 33% the further from camera the label is
                    1.33
                )
            }
            entity.label = new LabelGraphics(labelGraphicsOptions)
        }
    } else {
        log.warn('[Cesium] GeoJSON style not found for', entity)
    }
}
