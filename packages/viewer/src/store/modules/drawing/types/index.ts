import type { KMLLayer } from '@swissgeo/layers'
import type Feature from 'ol/Feature'
import type { Geometry } from 'ol/geom'
import type { Raw } from 'vue'

import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'

import type { EditableFeature, EditableFeatureTypes } from '@/api/features/types'
import type { DrawingIconSet } from '@/api/icons/types'
import type { FeatureStyleColor, FeatureStyleSize, TextPlacement } from '@/utils/featureStyle/types'

/**
 * - 'MODIFY': Mode for modifying existing features
 * - 'EXTEND': Mode for extending existing features (for line only)
 */
export type EditMode = 'OFF' | 'MODIFY' | 'EXTEND'

/**
 * Possible states of the drawing save process:
 *
 * - 'INITIAL': First state when entering the drawing mode
 * - 'LOADED': Drawing has been loaded from the KML
 * - 'UNSAVED_CHANGES': Pending changes -> drawing has been modified and is not saved
 * - 'SAVING': Drawing is being saved
 * - 'SAVED': Drawing has been saved, and no pending changes are remaining
 * - 'SAVE_ERROR': Could not save drawing
 * - 'LOAD_ERROR': Could not load drawing
 */
export type DrawingSaveState =
    | 'INITIAL'
    | 'LOADED'
    | 'UNSAVED_CHANGES'
    | 'SAVING'
    | 'SAVED'
    | 'SAVE_ERROR'
    | 'LOAD_ERROR'

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
    /** KML is saved online using the KML backend service */
    online: boolean
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

export type DrawingStore = ReturnType<typeof import('@/store/modules/drawing').default>
