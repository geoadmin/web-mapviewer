import {
    Billboard,
    BillboardCollection,
    Color,
    GroundPolylinePrimitive,
    Label,
    LabelCollection,
    Primitive,
    PrimitiveCollection,
} from 'cesium'

/**
 * This function goes throw the primitive collection and update passed properties
 * @param {PrimitiveCollection} collection
 * @param {{opacity: number | undefined, disableDepthTestDistance: number | undefined}} properties
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
        } else if (
            primitive instanceof PrimitiveCollection ||
            primitive instanceof BillboardCollection ||
            primitive instanceof LabelCollection
        ) {
            updateCollectionProperties(primitive, properties)
        }
    }
}
