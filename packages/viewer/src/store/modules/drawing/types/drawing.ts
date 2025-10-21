import type { DrawingIconSet } from '@/api/icon.api'
import type { EditMode } from '@/store/modules/drawing/types/EditMode.enum'
import type { ActionDispatcher } from '@/store/types'

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

export type DrawingStoreStateAndGetters = DrawingStoreState & DrawingStoreGetters

export interface ToggleDrawingOverlayPayload {
    show?: boolean
    online?: boolean
    kmlId?: string
    title?: string
}

export interface DrawingStoreActions {
    addDrawingFeature: (featureId: string, dispatcher: ActionDispatcher) => void
    clearDrawingFeatures: (dispatcher: ActionDispatcher) => void
    deleteDrawingFeature: (featureId: string, dispatcher: ActionDispatcher) => void
    loadAvailableIconSets: (dispatcher: ActionDispatcher) => void
    setDrawingFeatures: (featureIds: string[], dispatcher: ActionDispatcher) => void
    setDrawingMode: (mode: EditableFeatureTypes | undefined, dispatcher: ActionDispatcher) => void
    setDrawingName: (name: string, dispatcher: ActionDispatcher) => void
    setEditingMode: (
        mode: EditMode,
        reverseLineStringExtension: boolean,
        dispatcher: ActionDispatcher
    ) => void
    setIsDrawingEditShared: (isShared: boolean, dispatcher: ActionDispatcher) => void
    setIsDrawingModified: (isModified: boolean, dispatcher: ActionDispatcher) => void
    setIsVisitWithAdminId: (isVisitingWithAdminId: boolean, dispatcher: ActionDispatcher) => void
    toggleDrawingOverlay: (
        payload: ToggleDrawingOverlayPayload,
        dispatcher: ActionDispatcher
    ) => void
}

export type DrawingStore = ReturnType<typeof import('../index.ts').default>
