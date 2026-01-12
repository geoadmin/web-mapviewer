import type { PositionStore } from '@/store/modules/position/types'

export default function resolution(this: PositionStore): number {
    return this.projection.getResolutionForZoom(this.zoom, this.center)
}
