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

export function updateCollectionOpacity(collection, opacity) {
    for (let i = 0; i < collection.length; i++) {
        const primitive = collection.get(i)
        if (primitive instanceof Primitive || primitive instanceof GroundPolylinePrimitive) {
            if (primitive.appearance) {
                const material = primitive.appearance.material
                const color = material.uniforms.color || material.uniforms.evenColor
                material.uniforms.color = new Color(color.red, color.green, color.blue, opacity)
            }
        } else if (primitive instanceof Billboard) {
            if (primitive.color) {
                const color = primitive.color
                primitive.color = new Color(color.red, color.green, color.blue, opacity)
            }
        } else if (primitive instanceof Label) {
            if (primitive.fillColor) {
                const color = primitive.fillColor
                primitive.fillColor = new Color(color.red, color.green, color.blue, opacity)
            }
            if (primitive.outlineColor) {
                const color = primitive.outlineColor
                primitive.outlineColor = new Color(color.red, color.green, color.blue, opacity)
            }
        } else if (
            primitive instanceof PrimitiveCollection ||
            primitive instanceof BillboardCollection ||
            primitive instanceof LabelCollection
        ) {
            updateCollectionOpacity(primitive, opacity)
        }
    }
}
