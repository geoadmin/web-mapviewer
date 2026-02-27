import type { ActionDispatcher, DrawingStore } from '~/types/drawingStore'

import log from '@swissgeo/log'
import { debounceSaveDrawing, logConfig } from '#imports'

interface CloseDrawingOptions {
    userHasConfirmedNotWantToSaveAdminLink?: boolean
}

export default async function closeDrawing(
    this: DrawingStore,
    options: CloseDrawingOptions,
    dispatcher: ActionDispatcher
): Promise<void>
export default async function closeDrawing(
    this: DrawingStore,
    dispatcher: ActionDispatcher
): Promise<void>

/**
 * Close the drawing module and save the drawing if needed.
 *
 * @returns Will return a KML layer config if the drawing had any feature drawn/saved (saved on the
 *   backend only if the drawing was initialized with the online=true option). If no feature was
 *   drawn, it will return undefined.
 */
export default async function closeDrawing(
    this: DrawingStore,
    optionsOrDispatcher: CloseDrawingOptions | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
): Promise<void> {
    const options = dispatcherOrNothing ? (optionsOrDispatcher as CloseDrawingOptions) : {}
    const dispatcher = dispatcherOrNothing ?? (optionsOrDispatcher as ActionDispatcher)

    const { userHasConfirmedNotWantToSaveAdminLink = false } = options

    log.debug({
        ...logConfig('closeDrawing'),
        messages: [
            'Closing drawing module',
            {
                isDrawingModified: this.isDrawingModified,
                isDrawingNew: this.isDrawingNew,
                isDrawingEmpty: this.isDrawingEmpty,
                userHasConfirmedNotWantToSaveAdminLink,
            },
            dispatcher,
        ],
    })

    if (this.showWarningAdminLinkNotCopied && !userHasConfirmedNotWantToSaveAdminLink) {
        this.state = 'CLOSING_WAIT_FOR_USER_CONFIRMATION'
        return
    } else {
        this.state = 'CLOSING'
    }

    try {
        // Clear any pending save not started, then wait for in-progress saves
        if (this.save.pending) {
            clearTimeout(this.save.pending)
        }

        // Save on close when modified and (not new or not empty)
        if (this.isDrawingModified && (!this.isDrawingNew || !this.isDrawingEmpty)) {
            await debounceSaveDrawing({ debounceTime: 0, retryOnError: false })
        }
        if (this.olMap && this.layer.ol) {
            this.olMap.removeLayer(this.layer.ol)
        }

        this.edit.featureType = undefined
        this.layer.ol?.getSource()?.clear()

        this.layer.ol?.dispose()
        delete this.layer.ol

        this.state = 'CLOSED'
    } catch (error) {
        log.error({
            ...logConfig('closeDrawing'),
            messages: ['Error while closing drawing', error],
        })
        this.state = 'DRAWING'
    }
}
