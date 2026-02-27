import type { GeolocationStore } from '@/store/modules/geolocation/types'
import type { ActionDispatcher } from '@/store/types'

import setCenterIfInBounds from '@/store/modules/geolocation/utils/setCenterIfInBounds'

export default function setGeolocationTracking(
    this: GeolocationStore,
    isTracking: boolean,
    dispatcher: ActionDispatcher
) {
    this.tracking = isTracking

    // If tracking has been re-enabled by clicking on the geolocation button, we re-center the map.
    if (this.tracking && this.position) {
        setCenterIfInBounds.call(this, this.position, dispatcher)
    }
}
