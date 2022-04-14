<template>
    <slot />
</template>

<script>
import { Point } from 'ol/geom'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Feature } from 'ol'
import { sketchPointStyle } from '@/modules/drawing/lib/style'

export default {
    created() {
        this.positionOnMap = new Point([0, 0])
        /** Additional overlay to display azimuth circle */
        this.overlay = new VectorLayer({
            source: new VectorSource({
                useSpatialIndex: false,
                features: [new Feature(this.positionOnMap)],
            }),
            style: sketchPointStyle,
            updateWhileAnimating: true,
            updateWhileInteracting: true,
            zIndex: 2000,
        })
    },
}
</script>
