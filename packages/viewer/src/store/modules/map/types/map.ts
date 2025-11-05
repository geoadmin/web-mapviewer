import type { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'

import type { SelectableFeature } from '@/api/features.api'

import { ClickType } from '@/store/modules/map/types/clickType.enum'



export interface ClickInfo {
    coordinate: SingleCoordinate | FlatExtent
    pixelCoordinate?: SingleCoordinate
    features?: SelectableFeature<false>[] // LayerFeatures are not editable
    clickType?: ClickType
}

/**
 * Module that describes specific interactions with the map (dragging, clicking). It also serves as
 * a way to tell the map where to highlight stuff or place a pin (to keep the rest of the app
 * ignorant of the mapping framework)
 */
export interface MapState {
    /** Information about the last click that has occurred on the map */
    clickInfo: ClickInfo | undefined
    /** Coordinate of the dropped pin on the map. If null, no pin will be shown. */
    pinnedLocation: SingleCoordinate | undefined
    /**
     * Will be used to show the location of search entries when they are hovered. If we use the same
     * pinned location as the one above, the pinned location is lost as soon as another one is
     * hovered. Meaning that the search bar is still filled with a search query, but no pinned
     * location is present anymore.
     */
    previewedPinnedLocation: SingleCoordinate | undefined
    /** Coordinate of the locationPop on the map. If null, locationPopup will not be shown. */
    locationPopupCoordinates: SingleCoordinate | undefined
    /** Tells if the map is in print mode, meaning it will jump to a higher zoom level early. */
    printMode: boolean
    rectangleSelectionExtent: FlatExtent | undefined
}

export type MapStoreGetters = object

export type MapStore = ReturnType<typeof import('@/store/modules/map').default>
