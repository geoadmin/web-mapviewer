import {
    Cartesian2,
    Color,
    HeightReference,
    LabelGraphics,
    PointGraphics,
    VerticalOrigin,
} from 'cesium'

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
            return geoJsonStyle.values.find((value) => value.value === entityKeyValue)
        }
    }
    return null
}

export function setEntityStyle(entity, geoJsonStyle) {
    const style = getStyleForEntity(entity, geoJsonStyle)
    if (style) {
        const { vectorOptions } = style
        if (style.geomType === 'point') {
            const pointGraphicsOptions = {
                heightReference: HeightReference.RELATIVE_TO_GROUND,
                // disabling depth test
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }
            if (vectorOptions.fill) {
                pointGraphicsOptions.color = Color.fromCssColorString(vectorOptions.fill.color)
            }
            if (vectorOptions.radius) {
                pointGraphicsOptions.pixelSize = 2 * vectorOptions.radius
            }
            if (vectorOptions.stroke) {
                pointGraphicsOptions.outlineColor = Color.fromCssColorString(
                    vectorOptions.stroke.color
                )
                pointGraphicsOptions.outlineWidth = vectorOptions.stroke.width
            }
            entity.point = new PointGraphics(pointGraphicsOptions)
        }
        if (vectorOptions.label) {
            const labelGraphicsOptions = {
                heightReference: HeightReference.RELATIVE_TO_GROUND,
                // disabling depth test
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                text: getProcessedEntityLabelTemplate(entity, vectorOptions),
                verticalOrigin: VerticalOrigin.BOTTOM,
            }
            if (vectorOptions.label.text) {
                labelGraphicsOptions.font = vectorOptions.label.text.font
            }
            if (vectorOptions.label.text.fill) {
                labelGraphicsOptions.fill = Color.fromCssColorString(
                    vectorOptions.label.text.fill.color
                )
            }
            if (vectorOptions.label.text.stroke) {
                labelGraphicsOptions.outlineColor = Color.fromCssColorString(
                    vectorOptions.label.text.stroke.color
                )
                labelGraphicsOptions.outlineWidth = vectorOptions.label.text.stroke.width
            }
            if (vectorOptions.label.text.backgroundFill) {
                labelGraphicsOptions.showBackground = true
                labelGraphicsOptions.backgroundColor = Color.fromCssColorString(
                    vectorOptions.label.text.backgroundFill.color
                )
            }
            if (vectorOptions.label.text.offsetY) {
                labelGraphicsOptions.pixelOffset = new Cartesian2(
                    0,
                    vectorOptions.label.text.offsetY
                )
            }
            entity.label = new LabelGraphics(labelGraphicsOptions)
        }
    }
}
