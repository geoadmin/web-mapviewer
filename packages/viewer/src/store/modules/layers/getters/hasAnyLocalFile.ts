import type { LayersStore } from '@/store/modules/layers/types/layers'

export default function hasAnyLocalFile(this: LayersStore): boolean {
    return this.activeLayers.some((layer) => this.isLocalFile(layer))
}
