import {
    Cartesian2,
    Cartesian3,
    Cartographic,
    Color,
    HorizontalOrigin,
    LabelStyle,
    sampleTerrainMostDetailed,
    VerticalOrigin,
} from 'cesium'

const LABEL_HEIGHT_OFFSET = 2
const STEM_OUTLINE_WIDTH = 1
const LABEL_FONT_FAMILY = 'Arial, sans-serif'
const STEM_FONT_FAMILY = 'monospace'
const LABEL_BACKGROUND_COLOR = Color.fromCssColorString('#30343a').withAlpha(0.72)
const LABEL_BACKGROUND_PADDING = new Cartesian2(5, 2)

function getLabelColor(type) {
    if (type === 'SEE') {
        return Color.fromCssColorString('#2385e0')
    }
    if (type === 'GIPFEL') {
        return Color.fromCssColorString('#ec4c1b')
    }
    return Color.WHITE
}

function getLabelGraphics({
    text,
    fontSize,
    fontFamily,
    color,
    outlineColor = Color.WHITE,
    outlineWidth = 0,
    showBackground = false,
    verticalOrigin,
    pixelOffset = null,
}) {
    return {
        text,
        font: `${fontSize}px ${fontFamily}`,
        fillColor: color,
        outlineColor,
        outlineWidth,
        style: outlineWidth > 0 ? LabelStyle.FILL_AND_OUTLINE : LabelStyle.FILL,
        showBackground,
        backgroundColor: LABEL_BACKGROUND_COLOR,
        backgroundPadding: LABEL_BACKGROUND_PADDING,
        verticalOrigin,
        horizontalOrigin: HorizontalOrigin.CENTER,
        disableDepthTestDistance: 0,
        ...(pixelOffset ? { pixelOffset } : {}),
    }
}

function addLabelEntity(entities, position, labelOptions) {
    return entities.add({
        position,
        label: getLabelGraphics(labelOptions),
    })
}

function addLabel(entities, position, text, fontSize, color) {
    const baseLabelOptions = {
        color,
        fontSize,
    }
    return [
        addLabelEntity(entities, position, {
            ...baseLabelOptions,
            text,
            fontFamily: LABEL_FONT_FAMILY,
            showBackground: true,
            verticalOrigin: VerticalOrigin.BOTTOM,
        }),
        addLabelEntity(entities, position, {
            ...baseLabelOptions,
            text: '|',
            fontFamily: STEM_FONT_FAMILY,
            outlineColor: Color.WHITE,
            outlineWidth: STEM_OUTLINE_WIDTH,
            verticalOrigin: VerticalOrigin.TOP,
            pixelOffset: new Cartesian2(0, 4),
        }),
    ]
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
    entities.suspendEvents()
    try {
        features.forEach((feature, index) => {
            const position = positions[index]
            if (position) {
                labels.push(
                    ...addLabel(
                        entities,
                        position,
                        feature.text,
                        layer.fontSize,
                        getLabelColor(feature.type)
                    )
                )
            }
        })
    } finally {
        entities.resumeEvents()
    }
    return labels
}

export function updateSwissnamesLabelVisibility(tileCache, visibleKeys) {
    for (const [key, labels] of tileCache.entries()) {
        const show = visibleKeys.has(key)
        labels.forEach((labelEntity) => {
            labelEntity.show = show
        })
    }
}
