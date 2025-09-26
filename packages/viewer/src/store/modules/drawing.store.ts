import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

import type { DrawingIconSet } from '@/api/icon.api'
import { loadAllIconSetsFromBackend } from '@/api/icon.api'
import useFeaturesStore from '@/store/modules/features.store'
import { EditableFeatureTypes } from '@/api/features.api'

const defaultDrawingTitle = 'draw_mode_title'

/** @enum */
export enum EditMode {
    OFF = 'OFF',
    /** Mode for modifying existing features */
    MODIFY = 'MODIFY',
    /** Mode for extending existing features (for line only) */
    EXTEND = 'EXTEND',
}

export interface DrawingState {
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

const useDrawingStore = defineStore('drawing', {
    state: (): DrawingState => ({
        mode: undefined,
        iconSets: [],
        featureIds: [],
        drawingOverlay: {
            show: false,
            title: defaultDrawingTitle,
        },
        online: true,
        temporaryKmlId: undefined,
        name: undefined,
        reverseLineStringExtension: false,
        editingMode: EditMode.OFF,
        isDrawingEditShared: false,
        isDrawingModified: false,
        isVisitWithAdminId: false,
    }),
    getters: {
        isDrawingEmpty(): boolean {
            return this.featureIds.length === 0
        },

        showNotSharedDrawingWarning(): boolean {
            return (
                !this.isVisitWithAdminId &&
                !this.isDrawingEditShared &&
                this.isDrawingModified &&
                this.online
            )
        },
    },
    actions: {
        setDrawingMode(mode: EditableFeatureTypes | undefined, dispatcher: ActionDispatcher) {
            if (mode === undefined || mode in EditableFeatureTypes) {
                this.mode = mode
            }
        },

        setIsDrawingEditShared(isShared: boolean, dispatcher: ActionDispatcher) {
            this.isDrawingEditShared = isShared
        },

        setIsDrawingModified(isModified: boolean, dispatcher: ActionDispatcher) {
            this.isDrawingModified = isModified
        },

        setIsVisitWithAdminId(isVisitingWithAdminId: boolean, dispatcher: ActionDispatcher) {
            this.isVisitWithAdminId = isVisitingWithAdminId
        },

        async loadAvailableIconSets(dispatcher: ActionDispatcher) {
            const iconSets = await loadAllIconSetsFromBackend()
            if (iconSets?.length > 0) {
                this.iconSets = iconSets
            }
        },

        addDrawingFeature(featureId: string, dispatcher: ActionDispatcher) {
            this.featureIds.push(featureId)
        },

        deleteDrawingFeature(featureId: string, dispatcher: ActionDispatcher) {
            const featuresStore = useFeaturesStore()
            featuresStore.clearAllSelectedFeatures(dispatcher)
            this.featureIds = this.featureIds.filter(
                (existingFeatureId) => existingFeatureId !== featureId
            )
        },

        clearDrawingFeatures(dispatcher: ActionDispatcher) {
            this.featureIds = []
        },

        setDrawingFeatures(featureIds: string[], dispatcher: ActionDispatcher) {
            this.featureIds = [...featureIds]
        },

        toggleDrawingOverlay(
            payload: { online?: boolean; kmlId?: string; title?: string },
            dispatcher: ActionDispatcher
        ) {
            const { online, kmlId, title = defaultDrawingTitle } = payload
            this.drawingOverlay.show = !this.drawingOverlay.show
            this.drawingOverlay.title = title
            this.online = typeof online === 'boolean' ? online : true
            this.temporaryKmlId = kmlId
        },

        setDrawingName(name: string, dispatcher: ActionDispatcher) {
            this.name = name
        },

        setEditingMode(
            mode: EditMode,
            reverseLineStringExtension: boolean,
            dispatcher: ActionDispatcher
        ) {
            this.editingMode = mode
            if (mode !== EditMode.EXTEND) {
                this.reverseLineStringExtension = false
            } else {
                this.reverseLineStringExtension = reverseLineStringExtension
            }
        },
    },
})

export default useDrawingStore
