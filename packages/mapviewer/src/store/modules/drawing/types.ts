import type {
    DrawingIconSet,
    EditableFeature,
    EditableFeatureTypes,
    FeatureStyleColor,
    FeatureStyleSize,
    TextPlacement,
} from '@swissgeo/api'
import type { KMLLayer } from '@swissgeo/layers'
import type Feature from 'ol/Feature'
import type { Geometry } from 'ol/geom'
import type VectorLayer from 'ol/layer/Vector'
import type VectorSource from 'ol/source/Vector'
import type { Raw } from 'vue'

import type useDrawingStore from '@/store/modules/drawing'

export enum DrawingSaveState {
    /** First state when entering the drawing mode */
    Initial = 'INITIAL',
    /** Drawing has been loaded */
    Loaded = 'LOADED',
    /** Pending changes -> drawing has been modified and is not saved */
    UnsavedChanges = 'UNSAVED_CHANGES',
    /** Drawing is being saved */
    Saving = 'SAVING',
    /** Drawing has been saved and no pending changes are remaining */
    Saved = 'SAVED',
    /** Could not save drawing */
    SaveError = 'SAVE_ERROR',
    /** Could not load drawing */
    LoadError = 'LOAD_ERROR',
}

export enum EditMode {
    Off = 'OFF',
    /** Mode for modifying existing features */
    Modify = 'MODIFY',
    /** Mode for extending existing features (for line only) */
    Extend = 'EXTEND',
}

export enum OnlineMode {
    // No online/offline mode selected
    None = 'NONE',
    // KML is saved online
    Online = 'ONLINE',
    // KML is saved only locally
    Offline = 'OFFLINE',
    // KML is saved online but an Offline drawing is also currently open
    OnlineWhileOffline = 'ONLINE_WHILE_OFFLINE',
    // KML is saved locally but an Online drawing is also currently open
    OfflineWhileOnline = 'OFFLINE_WHILE_ONLINE',
}

export interface DrawingPreferences {
    size: FeatureStyleSize
    color: FeatureStyleColor
    textPlacement: TextPlacement
}

export interface DrawingStoreState {
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
    /** List of all available icon sets for drawing (loaded from the backend service-icons) */
    iconSets: DrawingIconSet[]
    /** Drawing overlay configuration */
    overlay: {
        /** Flag to toggle drawing mode overlay */
        show: boolean
        /** Title translation key of the drawing overlay */
        title: string
    }
    save: {
        state: DrawingSaveState
        pending: ReturnType<typeof setTimeout> | undefined
    }
    /**
     * KML is saved online using the KML backend service Options:
     *
     * - Online: KML is saved online
     * - Offline: KML is saved only locally
     * - OnlineWhileOffline: KML is saved online but an Offline drawing is also currently open
     * - OfflineWhileOnline: KML is saved locally but an Online drawing is also currently open
     * - None: No online/offline mode selected
     */
    onlineMode: OnlineMode
    /** The name of the drawing, or undefined if no drawing is currently edited. */
    name?: string
    /** Flag to indicate if the drawing is new (not yet saved/existing on the backend) */
    isDrawingNew: boolean
    /** Flag to indicate if the drawing is shared with an admin id */
    isDrawingEditShared: boolean
    /** Flag to indicate if the website is visited with an admin id */
    isVisitWithAdminId: boolean
}

export interface DrawingStoreGetters {
    isDrawingEmpty(): boolean
    isDrawingModified(): boolean
    showNotSharedDrawingWarning(): boolean
}

export type DrawingStore = ReturnType<typeof useDrawingStore>
