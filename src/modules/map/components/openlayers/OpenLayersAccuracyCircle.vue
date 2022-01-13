<template>
    <div>
        <slot />
    </div>
</template>
<script>
import { Circle } from 'ol/geom'
import Feature from 'ol/Feature'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Fill, Stroke, Style } from 'ol/style'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'

const accuracyCircleStyle = new Style({
    fill: new Fill({
        color: [255, 0, 0, 0.1],
    }),
    stroke: new Stroke({
        color: [255, 0, 0, 0.9],
        width: 3,
    }),
})

/**
 * Component managing the rendering of a red transparent circle to show currently how accurate is
 * the geolocation
 */
export default {
    mixins: [addLayerToMapMixin],
    inject: ['getMap'],
    props: {
        position: {
            type: Array,
            required: true,
        },
        accuracy: {
            type: Number,
            required: true,
        },
        zIndex: {
            type: Number,
            default: -1,
        },
    },
    watch: {
        position: function (newPosition) {
            this.accuracyCircle.setCenter(newPosition)
        },
        accuracy: function (newAccuracy) {
            this.accuracyCircle.setRadius(newAccuracy)
        },
    },
    created() {
        this.accuracyCircle = new Circle(this.position, this.accuracy)
        this.accuracyCircleFeature = new Feature({
            geometry: this.accuracyCircle,
        })
        this.accuracyCircleFeature.setStyle(accuracyCircleStyle)
        this.layer = new VectorLayer({
            id: `geolocation-accuracy-layer`,
            source: new VectorSource({
                features: [this.accuracyCircleFeature],
            }),
        })
    },
}
</script>
