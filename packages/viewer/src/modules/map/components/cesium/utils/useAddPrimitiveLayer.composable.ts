import type {
    Cesium3DTileset,
    Viewer} from 'cesium';

import log, { LogPreDefinedColor } from '@swissgeo/log'
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
    VerticalOrigin
} from 'cesium'
import { type MaybeRef, onBeforeUnmount, onMounted, toRef, toValue, watch } from 'vue'

import { PRIMITIVE_DISABLE_DEPTH_TEST_DISTANCE } from '@/config/cesium.config'
import { CESIUM_SWISSNAMES3D_STYLE } from '@/modules/map/components/cesium/utils/swissnamesStyle.ts'

type AllCollectionPrimitives = PrimitiveCollection | BillboardCollection | LabelCollection
type AllPrimitives =
    | AllCollectionPrimitives
    | Primitive
    | Billboard
    | Label
    | GroundPolylinePrimitive

/** This function goes throw the primitive collection and updates passed properties */
export function updateCollectionProperties(
    collection: MaybeRef<AllPrimitives>,
    properties: { opacity?: number; disableDepthTestDistance?: number }
): void {
    const opacity =
        typeof properties.opacity === 'number' && properties.opacity >= 0 && properties.opacity <= 1
            ? properties.opacity
            : undefined
    const disableDepthTestDistance =
        typeof properties.disableDepthTestDistance === 'number'
            ? properties.disableDepthTestDistance
            : undefined

    if (
        !(toValue(collection) instanceof PrimitiveCollection) &&
        !(toValue(collection) instanceof BillboardCollection) &&
        !(toValue(collection) instanceof LabelCollection)
    ) {
        return
    }
    const primitiveCollection = toValue(collection) as AllCollectionPrimitives

    for (let i = 0; i < primitiveCollection.length; i++) {
        const primitive: AllPrimitives = primitiveCollection.get(i)
        // common for both label and billboard
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

interface UseAddPrimitiveLayerOptions {
    withEnhancedLabelStyle?: boolean
}

export default function useAddPrimitiveLayer(
    cesiumViewer: MaybeRef<Viewer | undefined>,
    tileSet: MaybeRef<Promise<Cesium3DTileset> | Cesium3DTileset>,
    opacity: MaybeRef<number>,
    options: MaybeRef<UseAddPrimitiveLayerOptions> = {}
) {
    let layer: AllPrimitives | undefined

    const { withEnhancedLabelStyle = false } = toValue(options)

    onMounted(async () => {
        const viewerInstance = toValue(cesiumViewer)
        if (!viewerInstance) {
            log.error({
                title: 'useAddPrimitiveLayer.composable',
                titleColor: LogPreDefinedColor.Red,
                messages: ['Cesium viewer is undefined', viewerInstance],
            })
            return
        }

        try {
            const loadedTileSet = await toValue(tileSet)
            if (withEnhancedLabelStyle) {
                loadedTileSet.style = CESIUM_SWISSNAMES3D_STYLE
            }
            layer = viewerInstance.scene.primitives.add(loadedTileSet)
            if (layer) {
                updateCollectionProperties(layer, {
                    opacity: toValue(opacity),
                    disableDepthTestDistance: PRIMITIVE_DISABLE_DEPTH_TEST_DISTANCE,
                })
            }
        } catch (error) {
            log.error({
                title: 'useAddPrimitiveLayer.composable',
                titleColor: LogPreDefinedColor.Red,
                messages: ['Error while loading tileset for', toValue(tileSet), error],
            })
        }
    })

    onBeforeUnmount(() => {
        const viewerInstance = toValue(cesiumViewer)
        if (layer && viewerInstance) {
            layer.show = false
            viewerInstance.scene.primitives.remove(layer)
            viewerInstance.scene.requestRender()
        }
    })

    watch(toRef(opacity), () => {
        if (layer) {
            updateCollectionProperties(layer, {
                opacity: toValue(opacity),
                disableDepthTestDistance: PRIMITIVE_DISABLE_DEPTH_TEST_DISTANCE,
            })
        }
    })
}
