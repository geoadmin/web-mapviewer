import { defineStore } from 'pinia'

import type {
    FeaturesStoreGetters,
    FeaturesStoreState,
} from '@/store/modules/features/types/features'

import clearAllSelectedFeatures from '@/store/modules/features/actions/clearAllSelectedFeatures'
import identifyFeatureAt from '@/store/modules/features/actions/identifyFeatureAt'
import loadMoreFeaturesForLayer from '@/store/modules/features/actions/loadMoreFeaturesForLayer'
import setHighlightedFeatureId from '@/store/modules/features/actions/setHighlightedFeatureId'
import setSelectedFeatures from '@/store/modules/features/actions/setSelectedFeatures'
import updateFeatures from '@/store/modules/features/actions/updateFeatures'
import selectedFeatures from '@/store/modules/features/getters/selectedFeatures'
import selectedLayerFeatures from '@/store/modules/features/getters/selectedLayerFeatures'

const state = (): FeaturesStoreState => ({
    selectedFeaturesByLayerId: [],
    selectedEditableFeatures: [],
    highlightedFeatureId: undefined,
})

const getters: FeaturesStoreGetters = {
    selectedLayerFeatures,
    selectedFeatures,
}

const actions = {
    clearAllSelectedFeatures,
    identifyFeatureAt,
    loadMoreFeaturesForLayer,
    setHighlightedFeatureId,
    setSelectedFeatures,
    updateFeatures,
}

const useFeaturesStore = defineStore('features', {
    state,
    getters: { ...getters },
    actions,
})

export default useFeaturesStore
