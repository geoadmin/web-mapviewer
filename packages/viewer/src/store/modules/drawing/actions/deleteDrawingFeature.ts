import type { EditableFeature } from '@swissgeo/api'

import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

import debounceSaveDrawing from '@/store/modules/drawing/utils/debounceSaveDrawing'
import useFeaturesStore from '@/store/modules/features'

export default function deleteDrawingFeature(
    this: DrawingStore,
    feature: EditableFeature,
    dispatcher: ActionDispatcher
) {
    const featuresStore = useFeaturesStore()
    featuresStore.clearAllSelectedFeatures(dispatcher)
    this.feature.all = this.feature.all.filter(
        (existingFeature) => existingFeature.id !== feature.id
    )
    debounceSaveDrawing().catch((error) => {
        log.error({
            title: 'Drawing store / deleteDrawingFeature',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Error while deleting feature', error],
        })
    })
}
