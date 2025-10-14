import type Map from 'ol/Map'
import type { Pinia } from 'pinia'
import type { Router, RouterHistory } from 'vue-router'

declare global {
    /** All the things we expose to Cypress */
    interface Window {
        map: Map
        store: Pinia
        vueRouterHistory: RouterHistory
        vueRouter: Router
        mapPointerEventReady?: boolean
    }
}
