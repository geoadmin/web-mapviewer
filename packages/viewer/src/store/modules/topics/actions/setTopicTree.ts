import type { GeoAdminLayer } from '@swissgeo/layers'

import { layerUtils } from '@swissgeo/layers/utils'

import type { TopicsStore } from '@/store/modules/topics/types/topics'
import type { ActionDispatcher } from '@/store/types'

export default function setTopicTree(
    this: TopicsStore,
    layers: GeoAdminLayer[],
    dispatcher: ActionDispatcher
): void {
    this.tree = layers.map((layer) => layerUtils.cloneLayer(layer))
}
