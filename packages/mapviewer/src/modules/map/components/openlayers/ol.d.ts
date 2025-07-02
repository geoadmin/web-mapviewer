import type Map from 'ol/Map'

declare global {
    interface Window {
        /** Exposing the map through the window for Cypress tests */
        map: Map
    }
}
