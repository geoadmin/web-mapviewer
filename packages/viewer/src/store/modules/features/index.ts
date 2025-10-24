import { defineStore } from 'pinia'

import type {
    FeaturesStoreGetters,
    FeaturesStoreState,
} from '@/store/modules/features/types/features'

import changeFeatureColor from '@/store/modules/features/actions/changeFeatureColor'
import changeFeatureCoordinates from '@/store/modules/features/actions/changeFeatureCoordinates'
import changeFeatureDescription from '@/store/modules/features/actions/changeFeatureDescription'
import changeFeatureGeometry from '@/store/modules/features/actions/changeFeatureGeometry'
import changeFeatureIcon from '@/store/modules/features/actions/changeFeatureIcon'
import changeFeatureIconSize from '@/store/modules/features/actions/changeFeatureIconSize'
import changeFeatureIsDragged from '@/store/modules/features/actions/changeFeatureIsDragged'
import changeFeatureShownDescriptionOnMap from '@/store/modules/features/actions/changeFeatureShownDescriptionOnMap'
import changeFeatureTextColor from '@/store/modules/features/actions/changeFeatureTextColor'
import changeFeatureTextOffset from '@/store/modules/features/actions/changeFeatureTextOffset'
import changeFeatureTextPlacement from '@/store/modules/features/actions/changeFeatureTextPlacement'
import changeFeatureTextSize from '@/store/modules/features/actions/changeFeatureTextSize'
import changeFeatureTitle from '@/store/modules/features/actions/changeFeatureTitle'
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
    changeFeatureColor,
    changeFeatureCoordinates,
    changeFeatureDescription,
    changeFeatureGeometry,
    changeFeatureIcon,
    changeFeatureIconSize,
    changeFeatureIsDragged,
    changeFeatureShownDescriptionOnMap,
    changeFeatureTextColor,
    changeFeatureTextOffset,
    changeFeatureTextPlacement,
    changeFeatureTextSize,
    changeFeatureTitle,
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
