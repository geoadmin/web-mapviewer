import type { EditableFeature, LayerFeature } from '@/api/features.api'

export interface FeaturesForLayer {
    layerId: string
    features: LayerFeature[]
    /**
     * If there are more data to load, this will be greater than 0. If no more data can be requested
     * from the backend, this will be set to 0.
     */
    featureCountForMoreData: number
}

export interface FeaturesStoreState {
    selectedFeaturesByLayerId: FeaturesForLayer[]
    selectedEditableFeatures: EditableFeature[]
    highlightedFeatureId: string | undefined
}

export interface FeaturesStoreGetters {
    selectedLayerFeatures(): LayerFeature[]
    selectedFeatures(): (EditableFeature | LayerFeature)[]
}

export type FeaturesStore = ReturnType<typeof import('@/store/modules/features').default>
