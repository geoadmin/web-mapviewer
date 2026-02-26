import { defineStore } from 'pinia'

import type { PositionStoreGetters, PositionStoreState } from '@/store/modules/position/types'

import { DEFAULT_PROJECTION } from '@/config'
import decreaseZoom from '@/store/modules/position/actions/decreaseZoom'
import increaseZoom from '@/store/modules/position/actions/increaseZoom'
import setAutoRotation from '@/store/modules/position/actions/setAutoRotation'
import setCameraPosition from '@/store/modules/position/actions/setCameraPosition'
import setCenter from '@/store/modules/position/actions/setCenter'
import setCrossHair from '@/store/modules/position/actions/setCrossHair'
import setDisplayedFormat from '@/store/modules/position/actions/setDisplayedFormat'
import setHasOrientation from '@/store/modules/position/actions/setHasOrientation'
import setProjection from '@/store/modules/position/actions/setProjection'
import setRotation from '@/store/modules/position/actions/setRotation'
import setZoom from '@/store/modules/position/actions/setZoom'
import zoomToExtent from '@/store/modules/position/actions/zoomToExtent'
import calculatePositionFromCamera from '@/store/modules/position/getters/calculatePositionFromCamera'
import centerEpsg4326 from '@/store/modules/position/getters/centerEpsg4326'
import extent from '@/store/modules/position/getters/extent'
import isExtentOnlyWithinLV95Bounds from '@/store/modules/position/getters/isExtentOnlyWithinLV95Bounds'
import resolution from '@/store/modules/position/getters/resolution'
import { LV95Format } from '@/utils/coordinates/coordinateFormat'

const state = (): PositionStoreState => ({
    displayFormat: LV95Format,
    // some unit tests fail because DEFAULT_PROJECTION is somehow not yet defined when they are run
    // hence the `?.` operator
    zoom: DEFAULT_PROJECTION.getDefaultZoom(),
    rotation: 0,
    autoRotation: false,
    hasOrientation: false,
    // some unit tests fail because DEFAULT_PROJECTION is somehow not yet defined when they are run
    // hence the `?.` operator
    center: DEFAULT_PROJECTION.bounds.center,
    projection: DEFAULT_PROJECTION,
    crossHair: undefined,
    crossHairPosition: undefined,
    camera: undefined,
})

const getters: PositionStoreGetters = {
    centerEpsg4326,
    resolution,
    extent,
    isExtentOnlyWithinLV95Bounds,
    calculatePositionFromCamera,
}

const actions = {
    setDisplayedFormat,
    setZoom,
    increaseZoom,
    decreaseZoom,
    zoomToExtent,
    setRotation,
    setAutoRotation,
    setHasOrientation,
    setCenter,
    setCrossHair,
    setCameraPosition,
    setProjection,
}

const usePositionStore = defineStore('position', {
    state,
    getters: { ...getters },
    actions,
})

export default usePositionStore
