import type { SingleCoordinate } from '@swissgeo/coordinates'

import { WGS84 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import proj4 from 'proj4'

import type { PositionStore } from '@/store/modules/position/types/position'
import type { ActionDispatcher } from '@/store/types'

import useCesiumStore from '@/store/modules/cesium'
import useGeolocationStore from '@/store/modules/geolocation'

export default function setCenter(
    this: PositionStore,
    center: SingleCoordinate,
    dispatcher: ActionDispatcher
): void {
    if (!center || (Array.isArray(center) && center.length !== 2)) {
        log.error({
            title: 'Position store / setCenter',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Invalid center, ignoring', center, dispatcher],
        })
        return
    }

    if (this.projection.isInBounds(center)) {
        this.center = center
    } else {
        log.warn({
            title: 'Position store / setCenter',
            titleColor: LogPreDefinedColor.Red,
            messages: [
                'Center received is out of projection bounds, ignoring',
                this.projection,
                center,
                dispatcher,
            ],
        })
    }

    const geolocationStore = useGeolocationStore()

    // TODO: fix this, it stops the tracking when receiving the first geolocation position update
    if (geolocationStore.tracking && geolocationStore.position !== center) {
        // if we moved the map we disabled the geolocation tracking (unless the tracking moved the map)
        geolocationStore.setGeolocationTracking(false, dispatcher)
        this.setAutoRotation(false, dispatcher)
    }

    const cesiumStore = useCesiumStore()
    if (cesiumStore.active && this.camera) {
        // updating the 3D position with the new center values (from a search result selection, for example)
        const centerWgs84 = proj4<SingleCoordinate>(this.projection.epsg, WGS84.epsg, [
            this.center[0],
            this.center[1],
        ])
        // Use a special dispatcher to indicate this is a sync operation from setCenter
        // This prevents infinite recursion with setCameraPosition
        this.setCameraPosition(
            {
                x: centerWgs84[0],
                y: centerWgs84[1],
                z: this.camera.z,
                roll: this.camera.roll,
                pitch: this.camera.pitch,
                heading: this.camera.heading,
            },
            { name: 'setCenter' } // Special dispatcher to prevent recursion
        )
    }
}
