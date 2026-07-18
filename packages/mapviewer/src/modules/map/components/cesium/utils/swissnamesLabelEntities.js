import {
    Cartesian2,
    Cartesian3,
    Cartographic,
    Color,
    DistanceDisplayCondition,
    HorizontalOrigin,
    LabelStyle,
    sampleTerrainMostDetailed,
    VerticalOrigin,
} from 'cesium'

const LABEL_HEIGHT_OFFSET = 2
const STEM_OUTLINE_WIDTH = 1
const LABEL_FONT_FAMILY = 'Arial, sans-serif'
const STEM_FONT_FAMILY = 'monospace'
const LABEL_BACKGROUND_COLOR = Color.fromCssColorString('#15191e').withAlpha(0.94)
const LABEL_BACKGROUND_PADDING = new Cartesian2(5, 2)
const LAKE_LABEL_COLOR = Color.fromCssColorString('#b8e1ff')
const PEAK_LABEL_COLOR = Color.fromCssColorString('#ffc2a8')

function getLabelColor(type) {
    if (type === 'SEE') {
        return LAKE_LABEL_COLOR
    }
    if (type === 'GIPFEL') {
        return PEAK_LABEL_COLOR
    }
    return Color.WHITE
}

function addLabel(entities, position, feature, layer, distanceStyle) {
    const sharedGraphics = {
        fillColor: getLabelColor(feature.type),
        outlineColor: Color.WHITE,
        backgroundColor: LABEL_BACKGROUND_COLOR,
        backgroundPadding: LABEL_BACKGROUND_PADDING,
        horizontalOrigin: HorizontalOrigin.CENTER,
        disableDepthTestDistance: 0,
        ...distanceStyle,
    }

    const textLabel = entities.add({
        position,
        label: {
            ...sharedGraphics,
            text: feature.text,
            font: `${layer.fontSize}px ${LABEL_FONT_FAMILY}`,
            outlineWidth: 0,
            style: LabelStyle.FILL,
            showBackground: true,
            verticalOrigin: VerticalOrigin.BOTTOM,
        },
    })
    const stemLabel = entities.add({
        position,
        label: {
            ...sharedGraphics,
            text: '|',
            font: `${layer.fontSize}px ${STEM_FONT_FAMILY}`,
            outlineWidth: STEM_OUTLINE_WIDTH,
            style: LabelStyle.FILL_AND_OUTLINE,
            showBackground: false,
            verticalOrigin: VerticalOrigin.TOP,
            pixelOffset: new Cartesian2(0, 4),
        },
    })

    return [textLabel, stemLabel]
}

export async function getSwissnamesTerrainPositions(viewer, features) {
    const terrainPositions = features.map((feature) =>
        Cartographic.fromDegrees(feature.lon, feature.lat)
    )
    await sampleTerrainMostDetailed(viewer.terrainProvider, terrainPositions)
    return terrainPositions.map((terrainPosition) => {
        if (!Number.isFinite(terrainPosition.height)) {
            return null
        }
        return Cartesian3.fromRadians(
            terrainPosition.longitude,
            terrainPosition.latitude,
            terrainPosition.height + LABEL_HEIGHT_OFFSET
        )
    })
}

export function addSwissnamesFeatureLabels(entities, features, positions, layer) {
    const labels = []
    const distanceStyle = {
        distanceDisplayCondition: new DistanceDisplayCondition(0, layer.maxDistance),
    }
    entities.suspendEvents()
    try {
        features.forEach((feature, index) => {
            const position = positions[index]
            if (!position) {
                return
            }
            labels.push(...addLabel(entities, position, feature, layer, distanceStyle))
        })
    } finally {
        entities.resumeEvents()
    }
    return labels
}

export function evictInvisibleSwissnamesLabels(entities, tileCache, visibleKeys) {
    let eventsSuspended = false
    try {
        for (const [key, labels] of tileCache.entries()) {
            if (visibleKeys.has(key)) {
                continue
            }
            if (labels.length > 0 && !eventsSuspended) {
                entities.suspendEvents()
                eventsSuspended = true
            }
            labels.forEach((labelEntity) => entities.remove(labelEntity))
            tileCache.delete(key)
        }
    } finally {
        if (eventsSuspended) {
            entities.resumeEvents()
        }
    }
}
