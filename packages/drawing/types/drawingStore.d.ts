import type {
    DrawingIconSet,
    EditableFeature,
    EditableFeatureTypes,
    FeatureStyleColor,
    FeatureStyleSize,
    TextPlacement,
} from '@swissgeo/api'
import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { KMLLayer } from '@swissgeo/layers'
import type { Staging } from '@swissgeo/staging-config'
import type { Map } from 'ol'
import type Feature from 'ol/Feature'
import type { Geometry } from 'ol/geom'
import type VectorLayer from 'ol/layer/Vector'
import type VectorSource from 'ol/source/Vector'
import type { Raw } from 'vue'

import type useDrawingStore from '@/store'

export interface ActionDispatcher {
    name: string
}

export type DrawingState =
    | 'INITIALIZING'
    | 'DRAWING'
    | 'CLOSING'
    | 'CLOSING_WAIT_FOR_USER_CONFIRMATION'
    | 'CLOSED'

/**
 * Possible states of the drawing save process:
 *
 * - INITIAL: First state when entering the drawing mode
 * - LOADED: Drawing has been loaded
 * - UNSAVED_CHANGES: Pending changes -> drawing has been modified and is not saved
 * - SAVING: Drawing is being saved
 * - SAVED: Drawing has been saved and no pending changes are remaining
 * - SAVE_ERROR: Could not save drawing
 * - LOAD_ERROR: Could not load drawing
 */
export type DrawingSaveState =
    | 'INITIAL'
    | 'LOADED'
    | 'UNSAVED_CHANGES'
    | 'SAVING'
    | 'SAVED'
    | 'SAVE_ERROR'
    | 'LOAD_ERROR'

/**
 * To failsafe against the user not copying the link to his/her drawing, rendering him/her unable to
 * edit it further in the future, we keep track if the user has copied the link containing the admin
 * ID (token of ownership).
 *
 * If the link was not yet copied, and the user attempts to close a drawing that was saved, we warn
 * him/her about losing the "edit later" link for this drawing.
 */
export type DrawingShareLinkSaveState =
    | 'USER_STARTED_DRAWING_WITH_ADMIN_ID'
    | 'USER_HAS_NOT_COPIED_ADMIN_ID_LINK'
    | 'USER_HAS_COPIED_ADMIN_ID_LINK'

/**
 * Mode when editing features:
 *
 * - OFF: No editing mode selected
 * - MODIFY: Modify existing features
 * - EXTEND: Extend existing features (for line only)
 */
export type EditMode = 'OFF' | 'MODIFY' | 'EXTEND'

export interface DrawingPreferences {
    size: FeatureStyleSize
    color: FeatureStyleColor
    textPlacement: TextPlacement
}

export interface DrawingDebugConfig {
    /** If we should retry on failed backend requests. */
    retryOnError: boolean
    /** When testing with Cypress, shorten debounce time to avoid race conditions */
    quickDebounce: boolean
    staging: Staging
}

export interface DrawingStoreState {
    /**
     * The OpenLayer instance used to interact with the user to draw. It is received as a config of
     * the action initiateDrawing.
     */
    olMap?: Raw<Map>
    state: DrawingState
    /** Flag telling if KML is to be saved online using the KML backend service. */
    online: boolean
    /** The name of the drawing. Will set the name inside the KML file itself. */
    name: string
    /**
     * Description translation key of the drawing module. It will be displayed alongside the close
     * button
     */
    description: string
    /** The projection in which to draw features (and in which to read them out of a KML file). */
    projection: CoordinateSystem
    /** List of all available icon sets for drawing (loaded from the backend service-icons) */
    iconSets: DrawingIconSet[]

    layer: {
        ol?: Raw<VectorLayer<VectorSource<Feature<Geometry>>>>
        config?: KMLLayer
        /** KML ID to use for temporary local KML (only used when online === false) */
        temporaryKmlId?: string
    }

    edit: {
        /** Current drawing type (or `undefined` if there is none). */
        featureType?: EditableFeatureTypes
        /** Current editing mode. */
        mode: EditMode
        /**
         * If true, continue the line string from the starting vertex, else it will continue from
         * the last vertex
         */
        reverseLineStringExtension: boolean
        preferred: DrawingPreferences
    }

    feature: {
        current?: EditableFeature
        /** All features that have been drawn (or loaded from the KML). */
        all: EditableFeature[]
    }

    save: {
        state: DrawingSaveState
        pending: ReturnType<typeof setTimeout> | undefined
    }

    share: {
        adminLink?: string
        publicLink?: string
        hasAdminLinkBeenCopied: boolean
    }

    /** Flag to indicate if the drawing is new (not yet saved/existing on the backend) */
    isDrawingNew: boolean
    /** Flag to indicate if the drawing is shared with an admin id */
    isDrawingEditShared: boolean
    /** Flag to indicate if the website is visited with an admin id */
    isVisitWithAdminId: boolean

    debug: DrawingDebugConfig
}

export interface DrawingStoreGetters {
    isDrawingEmpty(): boolean
    isDrawingModified(): boolean
    showWarningAdminLinkNotCopied(): boolean
}

export type DrawingStore = ReturnType<typeof useDrawingStore>
