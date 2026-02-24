import { defineStore } from 'pinia'

import type { ProfileStoreState, ProfileStoreGetters } from '@/store/modules/profile/types'

import setCurrentFeatureSegmentIndex from '@/store/modules/profile/actions/setCurrentFeatureSegmentIndex'
import setProfileFeature from '@/store/modules/profile/actions/setProfileFeature'
import currentProfileCoordinates from '@/store/modules/profile/getters/currentProfileCoordinates'
import currentProfileExtent from '@/store/modules/profile/getters/currentProfileExtent'
import hasProfileFeatureMultipleGeometries from '@/store/modules/profile/getters/hasProfileFeatureMultipleGeometries'
import isProfileFeatureMultiFeature from '@/store/modules/profile/getters/isProfileFeatureMultiFeature'

const state = (): ProfileStoreState => ({
    feature: undefined,
    simplifyGeometry: true,
    currentFeatureGeometryIndex: 0,
})

const getters: ProfileStoreGetters = {
    isProfileFeatureMultiFeature,
    hasProfileFeatureMultipleGeometries,
    currentProfileCoordinates,
    currentProfileExtent,
}

const actions = {
    setCurrentFeatureSegmentIndex,
    setProfileFeature,
}

const useProfileStore = defineStore('profile', {
    state,
    getters: { ...getters },
    actions,
})

export default useProfileStore
