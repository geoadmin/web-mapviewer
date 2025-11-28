import type { SingleCoordinate } from '@swissgeo/coordinates'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import cloneDeep from 'lodash/cloneDeep'

import type { SelectableFeature } from '@/api/features.api'
import type { ProfileStore } from '@/store/modules/profile/types/profile'
import type { ActionDispatcher } from '@/store/types'

import { canFeatureShowProfile } from '@/store/modules/profile/utils/canFeatureShowProfile'
import { stitchMultiLine } from '@/store/modules/profile/utils/stitchMultiLine'

interface SetProfileFeatureOptions {
    simplifyGeometry?: boolean
}

export default function setProfileFeature(
    this: ProfileStore,
    feature: SelectableFeature<boolean> | undefined,
    options: SetProfileFeatureOptions,
    dispatcher: ActionDispatcher
): void
export default function setProfileFeature(
    this: ProfileStore,
    feature: SelectableFeature<boolean> | undefined,
    dispatcher: ActionDispatcher
): void
export default function setProfileFeature(
    this: ProfileStore,
    feature: SelectableFeature<boolean> | undefined,
    optionsOrDispatcher: SetProfileFeatureOptions | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
): void {
    const dispatcher = dispatcherOrNothing ?? (optionsOrDispatcher as ActionDispatcher)
    const options = dispatcherOrNothing ? (optionsOrDispatcher as SetProfileFeatureOptions) : {}

    const { simplifyGeometry = false } = options
    if (!feature) {
        this.feature = undefined
    } else if (canFeatureShowProfile(feature)) {
        // the feature comes from vuex, so if we mutate it directly it raises an error
        const profileFeature = cloneDeep(feature)
        if (!profileFeature.geometry) {
            return
        }
        if (profileFeature.geometry.type === 'MultiLineString') {
            // attempting to simplify the multiline into fewer "geometries"
            profileFeature.geometry.coordinates = stitchMultiLine(
                profileFeature.geometry.coordinates as SingleCoordinate[][],
                // empirically tested with Veloland layer, gives the best results without a tradeoff
                50.0 /* m */
            )
        }
        this.feature = profileFeature
    } else {
        log.warn({
            title: 'Profile store / setProfileFeature',
            titleColor: LogPreDefinedColor.Red,
            messages: [
                'Geometry type not supported to show a profile, ignoring',
                feature,
                dispatcher,
            ],
        })
    }
    this.simplifyGeometry = simplifyGeometry
}
