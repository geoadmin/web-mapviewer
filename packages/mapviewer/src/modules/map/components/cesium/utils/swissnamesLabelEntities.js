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
const LABEL_BACKGROUND_COLOR = Color.fromCssColorString('#22262b').withAlpha(0.88)
const LABEL_BACKGROUND_PADDING = new Cartesian2(5, 2)
const LAKE_LABEL_COLOR = Color.fromCssColorString('#54aaff')
const PEAK_LABEL_COLOR = Color.fromCssColorString('#ff7a4d')

// A label stays visible while the camera is within its layer's altitude band, so the same
// dataset thinning that gates tile fetching also gates label display distance. Regular
// layers are additionally capped so oblique views do not stack town/village names into a
// dense band along the horizon; only landmark tiers (country/canton-sized altitude bands)
// may render that far out.
const LANDMARK_ALTITUDE_BAND = 1000000
const LANDMARK_LABEL_DISPLAY_DISTANCE = 500000
const REGULAR_LABEL_DISPLAY_DISTANCE = 25000

function getLabelColor(type) {
    if (type === 'SEE') {
        return LAKE_LABEL_COLOR
    }
    if (type === 'GIPFEL') {
        return PEAK_LABEL_COLOR
    }
    return Color.WHITE
}

export function getSwissnamesLabelDistanceStyle(layer) {
    const altitudeBand = layer.maxAlt ?? LANDMARK_ALTITUDE_BAND
    const maxDistance =
        altitudeBand >= LANDMARK_ALTITUDE_BAND
            ? LANDMARK_LABEL_DISPLAY_DISTANCE
            : Math.min(altitudeBand, REGULAR_LABEL_DISPLAY_DISTANCE)
    return {
        distanceDisplayCondition: new DistanceDisplayCondition(0, maxDistance),
    }
}

function getLabelGraphics({
    text,
    fontSize,
    fontFamily,
    color,
    distanceStyle,
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
        ...distanceStyle,
        ...(pixelOffset ? { pixelOffset } : {}),
    }
}

function addLabelEntity(entities, position, labelOptions) {
    return entities.add({
        position,
        label: getLabelGraphics(labelOptions),
    })
}

function addLabel(entities, position, text, fontSize, color, distanceStyle) {
    const baseLabelOptions = {
        color,
        fontSize,
        distanceStyle,
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
    const distanceStyle = getSwissnamesLabelDistanceStyle(layer)
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
                        getLabelColor(feature.type),
                        distanceStyle
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
