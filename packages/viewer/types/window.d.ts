import type VectorLayer from 'ol/layer/Vector'
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
        kmlLayer?: VectorLayer
        kmlLayerUrl?: string
        gpxLayer?: VectorLayer
        gpxLayerUrl?: string
        CESIUM_BASE_URL?: string
        cesiumViewer?: Viewer
        drawingLayer?: VectorLayer<VectorSource<Feature<Geometry>>>
        chrome?: any
    }
}
