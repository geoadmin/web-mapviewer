import type { Layer } from '@geoadmin/layers'
import type { GeoAdminLayer } from '@geoadmin/layers/dist/types'

import { CoordinateSystem } from '@geoadmin/coordinates/dist/proj'

import type EditableFeature from '@/api/features/EditableFeature.class'
import type LayerFeature from '@/api/features/LayerFeature.class'
import type SelectableFeature from '@/api/features/SelectableFeature.class'
import type { SearchResult } from '@/api/search.api.ts'
import type { LayerTooltipConfig } from '@/config/cesium.config'

import { DrawingIconSet } from '@/api/icon.api'
import { ClickInfo } from '@/store/modules/map.store'

/** Module that tells if the app has finished loading (is ready to show stuff) */
interface AppState {
    /** Flag that tells if the app is ready to show data and the map */
    isReady: boolean
    /**
     * Flag telling that the Map Module is ready. This is useful for E2E testing which should not
     * start before the Map Module is ready.
     */
    isMapReady: boolean
}

interface CesiumState {
    /** Flag telling if the app should be displaying the map in 3D or not */
    active: boolean
    /**
     * Flag telling if the 3D viewer should show the vegetation layer (ch.swisstopo.vegetation.3d)
     *
     * The vegetation layer needs to be updated to work optimally with the latest version of Cesium.
     * While waiting for this update to be available, we disable the vegetation layer by default (it
     * can be activated through the debug tools on the side of the map)
     */
    showVegetation: boolean
    /**
     * Flag telling if the 3D viewer should show buildings (ch.swisstopo.swisstlbuildings3d.3d). As
     * this layer has already been updated for the latest Cesium stack, we activate it by default.
     */
    showBuildings: boolean
    /**
     * Flag telling if the 3D viewer should show buildings (ch.swisstopo.swisstlm3d.3d). As this
     * layer has already been updated for the latest Cesium stack, we activate it by default.
     */
    showConstructions: boolean
    /** Flag telling if the 3D viewer should show the labels () */
    showLabels: boolean
    /** Flag telling if the 3D viewer is ready or not */
    isViewerReady: boolean
    /**
     * An array of Cesium Layer tooltip configurations, stating which Cesium layers have tooltips,
     * and what should be shown to the user
     */
    layersTooltipConfig: LayerTooltipConfig[]
}

interface DrawingState {
    /** Current drawing mode (or `null` if there is none). See {@link EditableFeatureTypes} */
    mode: string | null
    /** List of all available icon sets for drawing (loaded from the backend service-icons) */
    iconSets: DrawingIconSet[]
    /**
     * Feature IDs of all features that have been drawn.
     *
     * Removing an ID from the list will trigger a watcher that will delete the respective feature.
     */
    featureIds: string[]
    /**
     * Drawing overlay configuration
     *
     * @type {{ show: boolean; title: string }}
     */
    drawingOverlay: {
        /** Flag to toggle drawing mode overlay */
        show: boolean
        /** Title translation key of the drawing overlay */
        title: string
    }
    /** KML is saved online using the KML backend service */
    online: boolean
    /** KML ID to use for temporary local KML (only used when online === false) */
    temporaryKmlId: string | null
    /** The name of the drawing, or null if no drawing is currently edited. */
    name: string | null
    /**
     * If true, continue the line string from the starting vertex, else it will continue from the
     * last vertex
     */
    reverseLineStringExtension: boolean
    /** Current editing mode. See {@link EditMode} */
    editingMode: 'OFF' | 'MODIFY' | 'EXTEND'
    /** Flag to indicate if the drawing is shared with an admin id */
    isDrawingEditShared: boolean
    /** Flag to indicate if the drawing has been modified */
    isDrawingModified: boolean
    /** Flag to indicate if the website is visited with an admin id */
    isVisitWithAdminId: boolean
}

interface FeaturesForLayer {
    layerId: string
    features: LayerFeature[]
    /**
     * If there are more data to load, this will be greater than 0. If no more data can be requested
     * from the backend, this will be set to 0.
     */
    featureCountForMoreData: number
}

interface FeaturesState {
    selectedFeaturesByLayerId: FeaturesForLayer[]
    selectedEditableFeatures: EditableFeature[]
    highlightedFeatureId: string | null
}

interface GeolocationState {
    /** Flag telling if the user has activated the geolocation feature */
    active: boolean
    /** Flag telling if the user has denied the geolocation usage in his/her browser settings */
    denied: boolean
    /** Flag telling if the geolocation position should always be at the center of the app */
    tracking: boolean
    /** Device position in the current application projection [x, y] */
    position: number[] | null
    /** Accuracy of the geolocation position, in meters */
    accuracy: number
}

interface I18nState {
    /**
     * The current language used by this application, expressed as an country ISO code
     * (`en`,`de`,`fr,etc...)
     */
    lang: 'en' | 'de' | 'fr' | 'it' | 'rm'
}

interface LayersState {
    /** Current background layer ID */
    currentBackgroundLayerId: string
    /**
     * Currently active layers (that have been selected by the user from the search bar or the layer
     * tree)
     *
     * Layers are ordered from bottom to top (last layer is shown on top of all the others)
     */
    activeLayers: Layer[]
    /** All layers' config available to this app */
    config: GeoAdminLayer[]
    /**
     * A layer to show on the map when hovering a layer (catalog and search) but not in the list of
     * active layers.
     */
    previewLayer: Layer | null
    /**
     * Year being picked by the time slider. The format is YYYY (but might evolve in the future in
     * the ISO 8601 date format direction, meaning YYYY-MM-DD, hence the String type).
     *
     * We store it outside the time config of layers so that layers revert back to their specific
     * chosen timestamp when the time slider is closed. That also means that the year picked by the
     * time slider doesn't end up in the URL params too.
     */
    previewYear: number | null
    /**
     * System layers. List of system layers that are added on top and cannot be directly controlled
     * by the user.
     */
    systemLayers: Layer[]
}

interface MapState {
    /** Information about the last click that has occurred on the map */
    clickInfo: ClickInfo | null
    /** Coordinate of the dropped pin on the map. If null, no pin will be shown. */
    pinnedLocation: number[]
    /**
     * Will be used to show the location of search entries when they are hovered. If we use the same
     * pinned location as the one above, the pinned location is lost as soon as another one is
     * hovered. Meaning that the search bar is still filled with a search query, but no pinned
     * location is present anymore.
     */
    previewedPinnedLocation: number[]
    /** Coordinate of the locationPop on the map. If null, locationPopup will not be shown. */
    locationPopupCoordinates: number[]
    /** Tells if the map is in print mode, meaning it will jump to a higher zoom level early. */
    printMode: boolean
}

interface CameraPosition {
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

interface PositionState {
    /** The display format selected for the mousetracker */
    displayedFormatId: string
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
    center: number[]
    /**
     * Projection used to express the position (and subsequently used to define how the mapping
     * framework will have to work under the hood)
     *
     * If LV95 is chosen, the map will use custom resolution to fit Swisstopo's Landeskarte specific
     * zooms (or scales) so that zoom levels will fit the different maps we have (1:500'000,
     * 1:100'000, etc...)
     */
    projection: CoordinateSystem
    crossHair: 'cross' | 'circle' | 'bowl' | 'point' | 'marker' | null
    crossHairPosition: number[] | null
    /**
     * Position of the view when we are in 3D, always expressed in EPSG:3857 (only projection system
     * that works with Cesium)
     *
     * Will be set to null when the 3D map is not active
     */
    camera: CameraPosition | null
}

interface PrintState {
    /** @deprecated Should be removed as soon as we've switched to the new print backend */
    layouts: string[]
    /** @deprecated Should be removed as soon as we've switched to the new print backend */
    selectedLayout: string | null
    /** @deprecated Should be removed as soon as we've switched to the new print backend */
    selectedScale: string | null
    printSectionShown: boolean
    printExtent: [number, number, number, number]
    config: {
        dpi: number
        layout: string
    }
}

interface ProfileState {
    feature: SelectableFeature | null
    simplifyGeometry: boolean
    /** The index of the current feature segment to highlight in the profile */
    currentFeatureSegmentIndex: number
}

interface SearchState {
    /** The search query, will trigger a search to the backend if it contains 3 or more characters */
    query: string
    /** Search results from the backend for the current query */
    results: SearchResult[]
    /** If true, the first search result will be automatically selected */
    autoSelect: boolean
}

export interface State {
    app: AppState
    cesium: CesiumState
    drawing: DrawingState
    features: FeaturesState
    geolocation: GeolocationState
    i18n: I18nState
    layers: LayersState
    map: MapState
    position: PositionState
    print: PrintState
    profile: ProfileState
}
