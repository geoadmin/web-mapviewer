import { defineStore } from 'pinia'

import type { MapState, MapStoreGetters } from '@/store/modules/map/types'

import clearClick from '@/store/modules/map/actions/clearClick'
import clearLocationPopupCoordinates from '@/store/modules/map/actions/clearLocationPopupCoordinates'
import clearPreviewPinnedLocation from '@/store/modules/map/actions/clearPreviewPinnedLocation'
import click from '@/store/modules/map/actions/click'
import setLocationPopupCoordinates from '@/store/modules/map/actions/setLocationPopupCoordinates'
import setMapHasBeenLoaded from '@/store/modules/map/actions/setMapHasBeenLoaded'
import setPinnedLocation from '@/store/modules/map/actions/setPinnedLocation'
import setPreviewedPinnedLocation from '@/store/modules/map/actions/setPreviewedPinnedLocation'
import setPrintMode from '@/store/modules/map/actions/setPrintMode'
import setRectangleSelectionExtent from '@/store/modules/map/actions/setRectangleSelectionExtent'

import clearPinnedLocation from './actions/clearPinnedLocation'

const state = (): MapState => ({
    clickInfo: undefined,
    pinnedLocation: undefined,
    previewedPinnedLocation: undefined,
    locationPopupCoordinates: undefined,
    printMode: false,
    rectangleSelectionExtent: undefined,
    hasBeenLoaded: false,
})

const getters: MapStoreGetters = {}

const actions = {
    click,
    clearClick,
    setPinnedLocation,
    setPreviewedPinnedLocation,
    clearPreviewPinnedLocation,
    clearPinnedLocation,
    clearLocationPopupCoordinates,
    setLocationPopupCoordinates,
    setPrintMode,
    setRectangleSelectionExtent,
    setMapHasBeenLoaded,
}

const useMapStore = defineStore('map', {
    state,
    getters: { ...getters },
    actions,
})

export default useMapStore
