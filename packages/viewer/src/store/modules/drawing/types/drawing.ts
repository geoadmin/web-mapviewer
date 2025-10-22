import type { DrawingIconSet } from '@/api/icon.api'
import type { EditMode } from '@/store/modules/drawing/types/EditMode.enum'

import { EditableFeatureTypes } from '@/api/features.api'

export interface DrawingStoreState {
    /** Current drawing mode (or `undefined` if there is none). */
    mode: EditableFeatureTypes | undefined
    /** List of all available icon sets for drawing (loaded from the backend service-icons) */
    iconSets: DrawingIconSet[]
    /**
     * Feature IDs of all features that have been drawn.
     *
     * Removing an ID from the list will trigger a watcher that will delete the respective feature.
     */
    featureIds: string[]
    /** Drawing overlay configuration */
    drawingOverlay: {
        /** Flag to toggle drawing mode overlay */
        show: boolean
        /** Title translation key of the drawing overlay */
        title: string
    }
    /** KML is saved online using the KML backend service */
    online: boolean
    /** KML ID to use for temporary local KML (only used when online === false) */
    temporaryKmlId: string | undefined
    /** The name of the drawing, or undefined if no drawing is currently edited. */
    name: string | undefined
    /**
     * If true, continue the line string from the starting vertex, else it will continue from the
     * last vertex
     */
    reverseLineStringExtension: boolean
    /** Current editing mode. */
    editingMode: EditMode
    /** Flag to indicate if the drawing is shared with an admin id */
    isDrawingEditShared: boolean
    /** Flag to indicate if the drawing has been modified */
    isDrawingModified: boolean
    /** Flag to indicate if the website is visited with an admin id */
    isVisitWithAdminId: boolean
}

export interface DrawingStoreGetters {
    isDrawingEmpty(): boolean
    showNotSharedDrawingWarning(): boolean
}

export type DrawingStore = ReturnType<typeof import('@/store/modules/drawing').default>
