import type {
    GeoAdminGeoJSONRangeDefinition,
    GeoAdminGeoJSONStyleDefinition,
    GeoAdminGeoJSONVectorOptions,
} from '@swissgeo/layers'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import type { Entity } from 'cesium'
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
import { getOlImageStyleForShape } from '@/modules/map/components/openlayers/utils/geoJsonStyleFromLiterals'

const BILLBOARD_PIXEL_OFFSET_Y: number = -10

function getProcessedEntityLabelTemplate(
    entity: Entity,
    vectorOptions?: GeoAdminGeoJSONVectorOptions
): string | undefined {
    const template = vectorOptions?.label?.template
    if (
        template &&
        entity.properties &&
        entity.properties.propertyNames &&
        entity.properties.propertyNames.length > 0
    ) {
        let processedTemplate = template
        entity.properties.propertyNames.forEach((prop) => {
            processedTemplate = processedTemplate.replace(
                `$\{${prop}}`,
                entity.properties![prop]!.getValue()
            )
        })
        return processedTemplate
    }
    return
}

function getEntityKeyValue(
    entity: Entity,
    geoJsonStyle: GeoAdminGeoJSONStyleDefinition
): string | number | undefined {
    if (!entity.properties) {
        return
    }
    try {
        const styleKey = geoJsonStyle.property
        return entity.properties[styleKey]?.getValue()
    } catch (error) {
        log.error({
            title: 'Cesium styleConverter',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Error while reading style from', geoJsonStyle, 'for entity', entity, error],
        })
        return
    }
}

function getStyleForEntity(
    entity: Entity,
    geoJsonStyle: GeoAdminGeoJSONStyleDefinition
): GeoAdminGeoJSONRangeDefinition | undefined {
    const entityKeyValue = getEntityKeyValue(entity, geoJsonStyle)
    if (!entityKeyValue) {
        log.debug({
            title: 'Cesium styleConverter',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Entity key value not found', entity],
        })
        return
    }
    if (geoJsonStyle.type === 'range' && typeof entityKeyValue === 'number') {
        return geoJsonStyle.ranges
            .filter(
                (rangeDefinition) =>
                    rangeDefinition.range[0] <= entityKeyValue &&
                    rangeDefinition.range[1] > entityKeyValue
            )
            .reduce((previous, current) => {
                if (!previous) {
                    return current
                } else if (
                    !previous.maxResolution ||
                    (current.maxResolution && previous.maxResolution > current.maxResolution)
                ) {
                    return current
                }
                return previous
            })
    } else if (geoJsonStyle.type === 'unique') {
        return geoJsonStyle.values.find((value) => {
            // totally assumed double equal sign; there is sometimes a type difference between GeoJSON entity
            // and the style (style has a number, entity has a "numerical" string value)
            return value.value == entityKeyValue
        })
    } else {
        log.error({
            title: 'Cesium styleConverter',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Unknown/unimplemented type of GeoJSON style', geoJsonStyle.type],
        })
    }
    return
}

export function setEntityStyle(
    entity: Entity,
    geoJsonStyle: GeoAdminGeoJSONStyleDefinition,
    opacity: number = 1.0
) {
    const style = getStyleForEntity(entity, geoJsonStyle)
    if (style && style.vectorOptions) {
        if (style.geomType === 'point') {
            const graphicsOptions = {
                heightReference: HeightReference.CLAMP_TO_TERRAIN,
                disableDepthTestDistance: 5000,
                ...style.vectorOptions,
            }
            // Here we use our OL style generator to extract the HTMLCanvas of an image (we already
            // deal with all the possibilities of our style JSON here)
            const olIcon = getOlImageStyleForShape(style.vectorOptions)
            const image = olIcon?.getImage(DEVICE_PIXEL_RATIO)
            if (olIcon && image instanceof HTMLCanvasElement) {
                entity.billboard = new BillboardGraphics({
                    ...graphicsOptions,
                    image,
                    color: Color.WHITE.withAlpha(opacity),
                    pixelOffset: new Cartesian2(0, BILLBOARD_PIXEL_OFFSET_Y),
                })
            }
        } else {
            log.debug({
                title: 'Cesium styleConverter',
                titleColor: LogPreDefinedColor.Lime,
                messages: ['[Cesium] geometry type not yet implemented', style],
            })
        }
        if (style.vectorOptions.label) {
            const labelGraphicsOptions: LabelGraphics.ConstructorOptions = {
                heightReference: HeightReference.RELATIVE_TO_GROUND,
                // no clipping with the terrain
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                // hiding labels if the element is far away from the camera (arbitrary values found by trial and error)
                // if not hidden, labels clutter the view and are unreadable when the camera is very high from the ground
                translucencyByDistance: new NearFarScalar(100000, 1.0, 120000, 0.0),
                text: getProcessedEntityLabelTemplate(entity, style.vectorOptions),
            }
            if (style.vectorOptions.label.text) {
                labelGraphicsOptions.font = style.vectorOptions.label.text.font
            }
            if (style.vectorOptions.label.text.fill) {
                labelGraphicsOptions.fillColor = Color.fromCssColorString(
                    style.vectorOptions.label.text.fill.color
                ).withAlpha(opacity)
            }
            if (style.vectorOptions.label.text.stroke) {
                labelGraphicsOptions.outlineColor = Color.fromCssColorString(
                    style.vectorOptions.label.text.stroke.color
                ).withAlpha(opacity)
                labelGraphicsOptions.outlineWidth = style.vectorOptions.label.text.stroke.width
            }
            if (style.vectorOptions.label.text.backgroundFill) {
                labelGraphicsOptions.showBackground = true
                labelGraphicsOptions.backgroundColor = Color.fromCssColorString(
                    style.vectorOptions.label.text.backgroundFill.color
                ).withAlpha(opacity)
            }
            if (style.vectorOptions.label.text.offsetY) {
                labelGraphicsOptions.pixelOffset = new Cartesian2(
                    0,
                    style.vectorOptions.label.text.offsetY + BILLBOARD_PIXEL_OFFSET_Y
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
        log.warn({
            title: 'Cesium styleConverter',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['GeoJSON style not found for', entity],
        })
    }
}
