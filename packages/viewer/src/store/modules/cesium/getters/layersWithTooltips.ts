import type { Layer } from '@swissgeo/layers'

import type { LayerTooltipConfig } from '@/config/cesium.config'
import type { CesiumStore } from '@/store/modules/cesium/types/cesium'

export default function layersWithTooltips(this: CesiumStore): Layer[] {
    return this.backgroundLayersFor3D.filter((bgLayer) =>
        this.layersTooltipConfig
            .map((layerConfig: LayerTooltipConfig) => layerConfig.layerId)
            .includes(bgLayer.id)
    )
}
