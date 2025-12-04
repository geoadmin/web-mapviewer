import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { EditableFeature } from '@/api/features/types'
import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

import debounceSaveDrawing from '@/store/modules/drawing/utils/debounceSaveDrawing'
import useFeaturesStore from '@/store/modules/features'
import useProfileStore from '@/store/modules/profile'

export default function setCurrentlyDrawnFeature(
    this: DrawingStore,
    feature: EditableFeature | undefined,
    dispatcher: ActionDispatcher
) {
    this.feature.current = feature

    const featureStore = useFeaturesStore()
    const profileStore = useProfileStore()

    if (this.feature.current) {
        this.edit.mode = 'MODIFY'
        featureStore.setSelectedFeatures([this.feature.current], dispatcher)
        // showing the profile for measure and line/polygon features
        if (['MEASURE', 'LINEPOLYGON'].includes(this.feature.current.featureType)) {
            profileStore.setProfileFeature(this.feature.current, dispatcher)
        }
        if (!this.feature.all.some((feature) => feature.id === this.feature.current?.id)) {
            debounceSaveDrawing().catch((error) => {
                log.error({
                    title: 'Drawing store / setCurrentlyDrawnFeature',
                    titleColor: LogPreDefinedColor.Lime,
                    messages: ['Error while saving new feature', error],
                })
            })
        }
    } else {
        this.edit.mode = 'OFF'
        featureStore.clearAllSelectedFeatures(dispatcher)
    }
}
