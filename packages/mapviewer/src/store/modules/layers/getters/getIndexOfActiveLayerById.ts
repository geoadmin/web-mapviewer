import type { LayersStore } from '@/store/modules/layers/types'

export default function getIndexOfActiveLayerById(this: LayersStore): (layerId: string) => number {
    return (layerId: string) => this.activeLayers.findIndex((layer) => layer.id === layerId)
}
