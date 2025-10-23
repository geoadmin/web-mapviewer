import { defineStore } from 'pinia'

import type { MapState, MapStoreGetters } from '@/store/modules/map/types/map'

import clearClick from '@/store/modules/map/actions/clearClick'
import clearLocationPopupCoordinates from '@/store/modules/map/actions/clearLocationPopupCoordinates'
import clearPreviewPinnedLocation from '@/store/modules/map/actions/clearPreviewPinnedLocation'
import click from '@/store/modules/map/actions/click'
import setLocationPopupCoordinates from '@/store/modules/map/actions/setLocationPopupCoordinates'
import setPinnedLocation from '@/store/modules/map/actions/setPinnedLocation'
import setPreviewedPinnedLocation from '@/store/modules/map/actions/setPreviewedPinnedLocation'
import setPrintMode from '@/store/modules/map/actions/setPrintMode'
import setRectangleSelectionExtent from '@/store/modules/map/actions/setRectangleSelectionExtent'

const state = (): MapState => ({
    clickInfo: undefined,
    pinnedLocation: undefined,
    previewedPinnedLocation: undefined,
    locationPopupCoordinates: undefined,
    printMode: false,
    rectangleSelectionExtent: undefined,
})

const getters: MapStoreGetters = {}

const actions = {
    click,
    clearClick,
    setPinnedLocation,
    setPreviewedPinnedLocation,
    clearPreviewPinnedLocation,
    clearLocationPopupCoordinates,
    setLocationPopupCoordinates,
    setPrintMode,
    setRectangleSelectionExtent,
}

const useMapStore = defineStore('map', {
    state,
    getters: { ...getters },
    actions,
})

export default useMapStore
export type { ClickInfo } from '@/store/modules/map/types/map'
export { ClickType } from '@/store/modules/map/types/map'