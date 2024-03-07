import { Cartesian3, Color as CesiumColor, ImageMaterialProperty } from 'cesium'
import type { Color as OLColor } from 'ol/color'
import type { Coordinate } from 'ol/coordinate'
import { get as getProjection } from 'ol/proj'
import type { ProjectionLike } from 'ol/proj.js'
import { Geometry } from 'ol/geom'
import type { ColorLike, PatternDescriptor } from 'ol/colorlike'

/** Convert a 2D or 3D OpenLayers coordinate to Cesium. */
export function ol4326CoordinateToCesiumCartesian(coordinate: Coordinate): Cartesian3 {
    const coo = coordinate
    return coo.length > 2
        ? Cartesian3.fromDegrees(coo[0], coo[1], coo[2])
        : Cartesian3.fromDegrees(coo[0], coo[1])
}

/** Convert an array of 2D or 3D OpenLayers coordinates to Cesium. */
export function ol4326CoordinateArrayToCsCartesians(coordinates: Coordinate[]): Cartesian3[] {
    console.assert(coordinates !== null)
    const toCartesian = ol4326CoordinateToCesiumCartesian
    const cartesians = []
    for (const element of coordinates) {
        cartesians.push(toCartesian(element))
    }
    return cartesians
}

/**
 * Reproject an OpenLayers geometry to EPSG:4326 if needed. The geometry will be cloned only when
 * original projection is not EPSG:4326 and the properties will be shallow copied.
 */
export function olGeometryCloneTo4326<T extends Geometry>(
    geometry: T,
    projection: ProjectionLike
): T {
    console.assert(projection)

    const proj4326 = getProjection('EPSG:4326')
    const proj = getProjection(projection)
    if (proj && proj4326 && proj.getCode() !== proj4326.getCode()) {
        const properties = geometry.getProperties()
        geometry = geometry.clone() as T
        geometry.transform(proj, proj4326)
        geometry.setProperties(properties)
    }
    return geometry
}

/** Convert an OpenLayers color to Cesium. */
export function convertColorToCesium(
    olColor: ColorLike | OLColor | PatternDescriptor | CanvasGradient | CanvasPattern | string
): CesiumColor | ImageMaterialProperty {
    olColor = olColor || 'black'
    if (Array.isArray(olColor)) {
        return new CesiumColor(
            CesiumColor.byteToFloat(olColor[0]),
            CesiumColor.byteToFloat(olColor[1]),
            CesiumColor.byteToFloat(olColor[2]),
            olColor[3]
        )
    } else if (typeof olColor == 'string') {
        return CesiumColor.fromCssColorString(olColor)
    } else if (olColor instanceof CanvasPattern || olColor instanceof CanvasGradient) {
        // Render the CanvasPattern/CanvasGradient into a canvas that will be sent to Cesium as material
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (ctx) {
            canvas.width = canvas.height = 256
            ctx.fillStyle = olColor
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            return new ImageMaterialProperty({
                image: canvas,
            })
        }
    }
    throw new Error('No color could be parsed')
}
