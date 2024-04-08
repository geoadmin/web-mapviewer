import {
    Cartesian2,
    Cartesian3,
    Cartographic,
    HeadingPitchRange,
    Math as CesiumMath,
    Matrix4,
    Ray,
    Rectangle,
    Transforms,
} from 'cesium'
import proj4 from 'proj4'

import { WGS84 } from '@/utils/coordinates/coordinateSystems.js'
import log from '@/utils/logging.js'

/**
 * Limits the camera pitch and roll.
 *
 * @param {number} minPitch
 * @param {number} maxPitch
 * @param {number} minRoll
 * @param {number} maxRoll
 */
export function limitCameraPitchRoll(minPitch, maxPitch, minRoll, maxRoll) {
    return function (scene) {
        const camera = scene.camera
        const pitch = CesiumMath.clamp(CesiumMath.negativePiToPi(camera.pitch), minPitch, maxPitch)
        const roll = CesiumMath.clamp(CesiumMath.negativePiToPi(camera.roll), minRoll, maxRoll)
        camera.setView({
            orientation: {
                heading: camera.heading,
                pitch: pitch,
                roll: roll,
            },
        })
    }
}

/**
 * Limits the camera center point to a rectangle.
 *
 * @param {Number[]} rectangle
 * @returns
 */
export function limitCameraCenter(extent) {
    const rectangle = Rectangle.fromDegrees(...extent)
    const windowPosition = new Cartesian2()
    const center = new Cartesian3()
    const pickRay = new Ray()
    const cartographicCenter = new Cartographic()
    const oldTransform = new Matrix4()
    const newTransform = new Matrix4()
    const hpr = new HeadingPitchRange()

    return function (scene) {
        const camera = scene.camera
        const ellipsoid = scene.globe.ellipsoid

        windowPosition.x = scene.canvas.clientWidth / 2
        windowPosition.y = scene.canvas.clientHeight / 2
        const ray = camera.getPickRay(windowPosition, pickRay)
        const viewCenter = scene.globe.pick(ray, scene, center)
        // check if the center of the view is outside the rectangle
        // if viewCenter is undefined, it means the center of the view is looking at the sky
        if (viewCenter) {
            const cartographicViewCenter = Cartographic.fromCartesian(
                viewCenter,
                ellipsoid,
                cartographicCenter
            )
            if (!Rectangle.contains(rectangle, cartographicViewCenter)) {
                // save the transformation matrix before changing the view
                const newFrame = Transforms.eastNorthUpToFixedFrame(
                    viewCenter,
                    ellipsoid,
                    newTransform
                )
                const oldFrame = Matrix4.clone(camera.transform, oldTransform)

                // compute the new center of the view
                cartographicCenter.longitude = CesiumMath.clamp(
                    cartographicCenter.longitude,
                    rectangle.west,
                    rectangle.east
                )
                cartographicCenter.latitude = CesiumMath.clamp(
                    cartographicCenter.latitude,
                    rectangle.south,
                    rectangle.north
                )
                const limitPoint = Cartographic.toCartesian(cartographicCenter, ellipsoid, center)
                hpr.heading = camera.heading
                hpr.pitch = camera.pitch
                hpr.range = Cartesian3.distance(camera.position, limitPoint)

                camera.lookAtTransform(newFrame)
                camera.lookAt(limitPoint, hpr)
                camera.lookAtTransform(oldFrame)
            }
        }
    }
}

/**
 * @param {Number} resolution
 * @param {Number} width Screen width in pixels
 * @returns {number}
 */
export function calculateHeight(resolution, width) {
    return (resolution * width) / (2 * Math.tan(Math.PI / 6))
}

/**
 * @param {Number} height
 * @param {Number} width Screen width in pixels
 * @returns {number}
 */
export function calculateResolution(height, width) {
    return (2 * Math.tan(Math.PI / 6) * height) / width
}

/**
 * Return the [X,Y] (no Z) coordinate of a screen pixel using a ray picker and the intersection with
 * the terrain.
 *
 * @param {Viewer} viewer
 * @param {Number} x Pixel coordinate X on the screen
 * @param {Number} y Pixel coordinate Y on the screen
 * @param {CoordinateSystem} outputProjection
 * @returns {[Number, Number]}
 */
export function getCoordinateAtScreenCoordinate(viewer, x, y, outputProjection) {
    const cartesian = viewer.scene.pickPosition(new Cartesian2(x, y))
    let coordinates = []
    if (cartesian) {
        const cartCoords = Cartographic.fromCartesian(cartesian)
        coordinates = proj4(WGS84.epsg, outputProjection.epsg, [
            (cartCoords.longitude * 180) / Math.PI,
            (cartCoords.latitude * 180) / Math.PI,
        ])
    } else {
        log.error('no coordinate found at this screen coordinates', [x, y])
    }
    return coordinates
}
