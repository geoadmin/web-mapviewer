import type { KMLLayer } from '@swissgeo/layers'

import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { ActionDispatcher } from '@/store/types'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
import useDrawingStore from '@/store/modules/drawing'
import { DrawingSaveState } from '@/store/modules/drawing/types'
import usePositionStore from '@/store/modules/position'
import { parseKml } from '@/utils/kmlUtils'

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
    const positionStore = usePositionStore()

    if (!drawingStore.layer.ol || !kmlLayer.kmlData) {
        log.error({
            title: 'addKmlFeaturesToDrawingLayer',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Missing KML data or drawing layer'],
        })
        return
    }

    if (addKmlLayerTimeout) {
        clearTimeout(addKmlLayerTimeout)
        addKmlLayerTimeout = undefined
    }

    try {
        const features = parseKml(
            kmlLayer,
            positionStore.projection,
            drawingStore.iconSets,
            positionStore.resolution
        )
        log.debug({
            title: 'addKmlFeaturesToDrawingLayer',
            titleColor: LogPreDefinedColor.Lime,
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
        drawingStore.setDrawingSaveState(DrawingSaveState.Loaded, dispatcher)
    } catch (error) {
        if (!kmlLayer.isLocalFile) {
            log.error({
                title: 'addKmlFeaturesToDrawingLayer',
                titleColor: LogPreDefinedColor.Lime,
                messages: [`Failed to load KML ${kmlLayer.fileId}`, error, kmlLayer],
            })
        } else {
            log.error({
                title: 'addKmlFeaturesToDrawingLayer',
                titleColor: LogPreDefinedColor.Lime,
                messages: [`Failed to load temporary KML ${kmlLayer.id}`, error, kmlLayer],
            })
        }

        drawingStore.setDrawingSaveState(DrawingSaveState.LoadError, dispatcher)
        if (!IS_TESTING_WITH_CYPRESS && retryOnError) {
            addKmlLayerTimeout = setTimeout(() => {
                addKmlFeaturesToDrawingLayer(kmlLayer, { retryOnError: false })
            }, 2000)
        }
    }
}
