import type { GeolocationStore } from '@/store/modules/geolocation/types'
import type { ActionDispatcher } from '@/store/types'

export default function setGeolocationDenied(
    this: GeolocationStore,
    isDenied: boolean,
    dispatcher: ActionDispatcher
) {
    this.denied = isDenied
    if (this.denied) {
        this.active = false
        this.tracking = false
    }
}
