import type { GeolocationStore } from '@/store/modules/geolocation/types/geolocation'
import type { ActionDispatcher } from '@/store/types'

export default function toggleGeolocation(this: GeolocationStore, dispatcher: ActionDispatcher) {
    this.setGeolocationActive(!this.active, dispatcher)
}
