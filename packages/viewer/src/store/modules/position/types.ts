import type { NormalizedExtent, SingleCoordinate } from '@swissgeo/coordinates'
import type { CoordinateSystem } from '@swissgeo/coordinates'

import type usePositionStore from '@/store/modules/position'
import type { CoordinateFormat } from '@/utils/coordinates/coordinateFormat'

export enum CrossHairs {
    Cross = 'cross',
    Circle = 'circle',
    Bowl = 'bowl',
    Point = 'point',
    Marker = 'marker',
}

export interface CameraPosition {
    /** X position of the camera in the 3D reference system (metric mercator) */
    x: number
    /** Y position of the camera in the 3D reference system (metric mercator) */
    y: number
    /** Z altitude of the camera in the 3D reference system (meters) */
    z: number
    /** Degrees of camera rotation on the heading axis ("compass" axis) */
    heading: number
    /** Degrees of camera rotation on the pitch axis ("nose up and down" axis) */
    pitch: number
    /**
     * Degrees of camera rotation on the roll axis ("barrel roll" axis, like if the camera was a
     * plane)
     */
    roll: number
}

export interface PositionStoreState {
    /** The display format selected for the mouse tracker */
    displayFormat: CoordinateFormat
    /** The map zoom level, which define the resolution of the view */
    zoom: number
    /** The map rotation expressed so that -Pi < rotation <= Pi */
    rotation: number
    /**
     * Flag which indicates if openlayers map rotates to align with true / magnetic north (only
     * possible if the device has orientation capabilities)
     */
    autoRotation: boolean
    /**
     * Flag which indicates if the device has orientation capabilities (e.g. can use map auto
     * rotate)
     */
    hasOrientation: boolean
    /** Center of the view expressed with the current projection */
    center: SingleCoordinate
    /**
     * Projection used to express the position (and subsequently used to define how the mapping
     * framework will have to work under the hood)
     *
     * If LV95 is chosen, the map will use custom resolution to fit Swisstopo's Landeskarte specific
     * zooms (or scales) so that zoom levels will fit the different maps we have (1:500'000,
     * 1:100'000, etc...)
     */
    projection: CoordinateSystem
    crossHair?: CrossHairs
    crossHairPosition?: SingleCoordinate
    /**
     * Position of the view when we are in 3D, always expressed in EPSG:3857 (only projection system
     * that works with Cesium)
     *
     * Will be set to undefined when the 3D map is not active
     */
    camera?: CameraPosition
}

export interface PositionStoreGetters {
    /** The center of the map reprojected in EPSG:4326 */
    centerEpsg4326(): SingleCoordinate
    /** Resolution of the view expressed in meter per pixel */
    resolution(): number
    /** The extent of the view, expressed with two coordinates numbers (`[ bottomLeft, topRight ]`) */
    extent(): NormalizedExtent
    /**
     * Flag telling if the current extent is contained into the LV95 bounds (meaning only things
     * from our LV 95 services are currently in display)
     */
    isExtentOnlyWithinLV95Bounds(): boolean
}

export type PositionStore = ReturnType<typeof usePositionStore>
