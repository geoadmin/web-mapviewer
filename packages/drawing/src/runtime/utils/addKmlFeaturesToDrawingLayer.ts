import type { KMLLayer } from '@swissgeo/layers'
import type { ActionDispatcher } from '~/types/drawingStore'

import { kmlUtils } from '@swissgeo/api/utils'
import log from '@swissgeo/log'
import { logConfig, useDrawingStore } from '#imports'

const dispatcher: ActionDispatcher = { name: 'addKmlFeaturesToDrawingLayer' }

let addKmlLayerTimeout: ReturnType<typeof setTimeout> | undefined

interface AddKmlFeaturesToDrawingLayerOptions {
    retryOnError?: boolean
}

export default function addKmlFeaturesToDrawingLayer(
    kmlLayer: KMLLayer,
    options?: AddKmlFeaturesToDrawingLayerOptions
): void {
    const { retryOnError = true } = options ?? {}

    const drawingStore = useDrawingStore()

    if (!drawingStore.layer.ol || !kmlLayer.kmlData) {
        log.error({
            ...logConfig('addKmlFeaturesToDrawingLayer'),
            messages: ['Missing KML data or drawing layer'],
        })
        return
    }

    if (addKmlLayerTimeout) {
        clearTimeout(addKmlLayerTimeout)
        addKmlLayerTimeout = undefined
    }

    try {
        const currentResolution = drawingStore.olMap?.getView().getResolution()
        if (typeof currentResolution !== 'number') {
            log.error({
                ...logConfig('addKmlFeaturesToDrawingLayer'),
                messages: ['Could not get current resolution of the map'],
            })
            return
        }
        const features = kmlUtils.parseKml(
            kmlLayer,
            drawingStore.projection,
            drawingStore.iconSets,
            currentResolution
        )
        log.debug({
            ...logConfig('addKmlFeaturesToDrawingLayer'),
            messages: ['Add features to drawing layer', features, drawingStore.layer.ol],
        })
        drawingStore.layer.ol.getSource()?.addFeatures(features)

        drawingStore.setDrawingName(kmlLayer.name, dispatcher)
        drawingStore.setDrawingFeatures(
            features
                .map((feature) => feature.get('editableFeature'))
                .filter((editableFeature) => !!editableFeature),
            dispatcher
        )
        drawingStore.setDrawingSaveState('LOADED', dispatcher)
    } catch (error) {
        if (!kmlLayer.isLocalFile) {
            log.error({
                ...logConfig('addKmlFeaturesToDrawingLayer'),
                messages: [`Failed to load KML ${kmlLayer.fileId}`, error, kmlLayer],
            })
        } else {
            log.error({
                ...logConfig('addKmlFeaturesToDrawingLayer'),
                messages: [`Failed to load temporary KML ${kmlLayer.id}`, error, kmlLayer],
            })
        }

        drawingStore.setDrawingSaveState('LOAD_ERROR', dispatcher)
        if (drawingStore.debug.retryOnError && retryOnError) {
            addKmlLayerTimeout = setTimeout(() => {
                addKmlFeaturesToDrawingLayer(kmlLayer, { retryOnError: false })
            }, 2000)
        }
    }
}
