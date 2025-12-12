import type Cesium from 'cesium'

declare global {
    /** Type definition for @geoblocks/cesium-compass */
    declare interface CesiumCompass {
        scene: Cesium.Scene
        clock: Cesium.Clock
        viewer: Cesium.Viewer
        ready: boolean
    }
}
