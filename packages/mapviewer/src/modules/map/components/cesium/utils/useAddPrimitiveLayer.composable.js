import log from '@geoadmin/log'
import {
    Billboard,
    BillboardCollection,
    Cartesian2,
    Cartesian3,
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
import { onBeforeUnmount, onMounted, toValue, watch } from 'vue'

import { PRIMITIVE_DISABLE_DEPTH_TEST_DISTANCE } from '@/config/cesium.config.js'
import { CESIUM_SWISSNAMES3D_STYLE } from '@/modules/map/components/cesium/utils/swissnamesStyle'

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

/**
 * @param {Viewer} cesiumViewer
 * @param {Promise<Cesium3DTileset> | Cesium3DTileset} tileSet
 * @param {Ref<Number>} opacity
 * @param {Object} options
 * @param {Boolean} options.withEnhancedLabelStyle
 */
export default function useAddPrimitiveLayer(cesiumViewer, tileSet, opacity, options = {}) {
    let layer

    const { withEnhancedLabelStyle = false } = options

    onMounted(async () => {
        try {
            const loadedTileSet = await tileSet
            if (withEnhancedLabelStyle) {
                loadedTileSet.style = CESIUM_SWISSNAMES3D_STYLE
            }
            layer = cesiumViewer.scene.primitives.add(loadedTileSet)
            updateCollectionProperties(layer, {
                opacity: toValue(opacity),
                disableDepthTestDistance: PRIMITIVE_DISABLE_DEPTH_TEST_DISTANCE,
            })
        } catch (error) {
            log.error('Error while loading tileset for', tileSet, error)
        }
    })

    onBeforeUnmount(() => {
        if (layer) {
            layer.show = false
            cesiumViewer.scene.primitives.remove(layer)
            cesiumViewer.scene.requestRender()
        }
    })

    watch(opacity, () => {
        if (layer) {
            updateCollectionProperties(layer, {
                opacity: toValue(opacity),
                disableDepthTestDistance: PRIMITIVE_DISABLE_DEPTH_TEST_DISTANCE,
            })
        }
    })
}
