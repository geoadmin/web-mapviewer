import {
    Billboard,
    BillboardCollection,
    Cartesian2,
    Cartesian3,
    Cesium3DTileset,
    Cesium3DTileStyle,
    Color,
    GroundPolylinePrimitive,
    HeightReference,
    HorizontalOrigin,
    Label,
    LabelCollection,
    NearFarScalar,
    Primitive,
    PrimitiveCollection,
    VerticalOrigin,
} from 'cesium'

import log from '@/utils/logging'

/**
 * Style to apply to our labels in 3D. It is a complete rip-off of
 * https://github.com/geoadmin/mf-geoadmin3/blob/6a7b99a2cc9980eec27b394ee709305a239549f1/src/components/StylesService.js#L159-L233
 *
 * @type {module:cesium.Cesium3DTileStyle}
 */
const cesiumEnchancedLabelStzle = new Cesium3DTileStyle({
    show: true,
    labelStyle: 2,
    labelText: '${DISPLAY_TEXT}',
    disableDepthTestDistance: 5000,
    anchorLineEnabled: true,
    anchorLineColor: "color('white')",
    heightOffset: {
        conditions: [
            ['${LOD} === "7"', 20],
            ['${LOD} === "6"', 40],
            ['${LOD} === "5"', 60],
            ['${LOD} === "4"', 80],
            ['${LOD} === "3"', 100],
            ['${LOD} === "2"', 120],
            ['${LOD} === "1"', 150],
            ['${LOD} === "0"', 200],
            ['true', '200'],
        ],
    },
    labelColor: {
        conditions: [
            ['${OBJEKTART} === "See"', 'color("blue")'],
            ['true', 'color("black")'],
        ],
    },
    labelOutlineColor: 'color("white", 1)',
    labelOutlineWidth: 5,
    font: {
        conditions: [
            ['${OBJEKTART} === "See"', '"bold 32px arial"'],
            ['${OBJEKTART} === "Alpiner Gipfel"', '"italic 32px arial"'],
            ['true', '" 32px arial"'],
        ],
    },
    scaleByDistance: {
        conditions: [
            ['${LOD} === "7"', 'vec4(1000, 1, 5000, 0.4)'],
            ['${LOD} === "6"', 'vec4(1000, 1, 5000, 0.4)'],
            ['${LOD} === "5"', 'vec4(1000, 1, 8000, 0.4)'],
            ['${LOD} === "4"', 'vec4(1000, 1, 10000, 0.4)'],
            ['${LOD} === "3"', 'vec4(1000, 1, 20000, 0.4)'],
            ['${LOD} === "2"', 'vec4(1000, 1, 30000, 0.4)'],
            ['${LOD} === "1"', 'vec4(1000, 1, 50000, 0.4)'],
            ['${LOD} === "0"', 'vec4(1000, 1, 500000, 0.4)'],
            ['true', 'vec4(1000, 1, 10000, 0.4)'],
        ],
    },
    translucencyByDistance: {
        conditions: [
            ['${LOD} === "7"', 'vec4(5000, 1, 5001, 1)'],
            ['${LOD} === "6"', 'vec4(5000, 1, 5001, 1)'],
            ['${LOD} === "5"', 'vec4(5000, 1, 8000, 0.4)'],
            ['${LOD} === "4"', 'vec4(5000, 1, 10000, 0.4)'],
            ['${LOD} === "3"', 'vec4(5000, 1, 20000, 0.4)'],
            ['${LOD} === "2"', 'vec4(5000, 1, 30000, 0.4)'],
            ['${LOD} === "1"', 'vec4(5000, 1, 50000, 0.4)'],
            ['${LOD} === "0"', 'vec4(5000, 1, 500000, 1)'],
            ['true', 'vec4(5000, 1, 10000, 0.5)'],
        ],
    },
    distanceDisplayCondition: {
        conditions: [
            ['${LOD} === "7"', 'vec2(0, 5000)'],
            ['${LOD} === "6"', 'vec2(0, 5000)'],
            ['${LOD} === "5"', 'vec2(0, 8000)'],
            ['${LOD} === "4"', 'vec2(0, 10000)'],
            ['${LOD} === "3"', 'vec2(0, 20000)'],
            ['${LOD} === "2"', 'vec2(0, 30000)'],
            ['${LOD} === "1"', 'vec2(0, 50000)'],
            ['${LOD} === "0"', 'vec2(0, 500000)'],
            ['${OBJEKTART} === "Alpiner Gipfel"', 'vec2(0, 100000)'],
        ],
    },
})

/**
 * This function goes throw the primitive collection and update passed properties
 *
 * @param {PrimitiveCollection} collection
 * @param {{ opacity: number | undefined; disableDepthTestDistance: number | undefined }} properties
 */
export function updateCollectionProperties(collection, properties) {
    const opacity =
        typeof properties.opacity === 'number' && properties.opacity >= 0 && properties.opacity <= 1
            ? properties.opacity
            : undefined
    const disableDepthTestDistance =
        typeof properties.disableDepthTestDistance === 'number'
            ? properties.disableDepthTestDistance
            : undefined

    for (let i = 0; i < collection.length; i++) {
        const primitive = collection.get(i)
        if (primitive instanceof Label || primitive instanceof Billboard) {
            // https://community.cesium.com/t/points-labels-stuck-under-terrain/11141/17
            primitive.eyeOffset = new Cartesian3(0.0, 0.0, -10.0)
            primitive.heightReference = HeightReference.CLAMP_TO_GROUND
            primitive.verticalOrigin = VerticalOrigin.CENTER
            primitive.horizontalOrigin = HorizontalOrigin.CENTER
        }

        if (primitive instanceof Primitive || primitive instanceof GroundPolylinePrimitive) {
            if (primitive.appearance && opacity !== undefined) {
                const material = primitive.appearance.material
                const color = material.uniforms.color || material.uniforms.evenColor
                material.uniforms.color = new Color(color.red, color.green, color.blue, opacity)
            }
        } else if (primitive instanceof Billboard) {
            if (disableDepthTestDistance !== undefined) {
                primitive.disableDepthTestDistance = disableDepthTestDistance
            }
            if (primitive.color && opacity !== undefined) {
                const color = primitive.color
                primitive.color = new Color(color.red, color.green, color.blue, opacity)
            }
        } else if (primitive instanceof Label) {
            if (disableDepthTestDistance !== undefined) {
                primitive.disableDepthTestDistance = disableDepthTestDistance
            }
            if (primitive.fillColor && opacity !== undefined) {
                const color = primitive.fillColor
                primitive.fillColor = new Color(color.red, color.green, color.blue, opacity)
            }
            if (primitive.outlineColor && opacity !== undefined) {
                const color = primitive.outlineColor
                primitive.outlineColor = new Color(color.red, color.green, color.blue, opacity)
            }
            primitive.showBackground = true
            primitive.backgroundColor = Color.BLACK.withAlpha(0.2)
            // https://community.cesium.com/t/points-labels-stuck-under-terrain/11141/17
            primitive.pixelOffset = new Cartesian2(0.0, -12.0)
            primitive.pixelOffsetScaleByDistance = new NearFarScalar(1.5e2, 3.0, 1.5e7, 0.5)
        } else if (
            primitive instanceof PrimitiveCollection ||
            primitive instanceof BillboardCollection ||
            primitive instanceof LabelCollection
        ) {
            updateCollectionProperties(primitive, properties)
        }
    }
}

export async function loadTileSetAndApplyStyle(tileSetJsonURL, options) {
    try {
        const { withEnhancedLabelStyle = false } = options
        const tileset = await Cesium3DTileset.fromUrl(tileSetJsonURL)
        if (withEnhancedLabelStyle) {
            tileset.style = cesiumEnchancedLabelStzle
        }
        return tileset
    } catch (error) {
        log.error('Error while loading tileset for', tileSetJsonURL, error)
    }
}
