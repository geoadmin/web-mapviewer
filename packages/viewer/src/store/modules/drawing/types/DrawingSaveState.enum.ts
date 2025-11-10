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
