import type { FlatExtent } from '@swissgeo/coordinates'

import { bbox, lineString } from '@turf/turf'

import type { ProfileStore } from '@/store/modules/profile/types'

export default function currentProfileExtent(this: ProfileStore): FlatExtent | undefined {
    if (!this.currentProfileCoordinates) {
        return
    }
    return bbox(lineString(this.currentProfileCoordinates)) as FlatExtent
}
