<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { EditableFeature } from '@/api/features.api'
import { IS_TESTING_WITH_CYPRESS } from '@/config'
import { CoordinateSystems } from '@/utils/coordinateUtils'
import KML from 'ol/format/KML'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'

/** Renders a KML file on the map */
export default {
    mixins: [addLayerToMapMixin],
    inject: ['getMap'],
    props: {
        layerId: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        opacity: {
            type: Number,
            default: 1.0,
        },
        projection: {
            type: String,
            default: CoordinateSystems.WEBMERCATOR.epsg,
        },
        zIndex: {
            type: Number,
            default: -1,
        },
    },
    watch: {
        url(newUrl) {
            this.layer.getSource().setUrl(newUrl)
        },
        opacity(newOpacity) {
            this.layer.setOpacity(newOpacity)
        },
    },
    created() {
        this.layer = new VectorLayer({
            opacity: this.opacity,
            source: new VectorSource({
                url: this.url,
                format: new KML(),
            }),
        })
        if (IS_TESTING_WITH_CYPRESS) {
            window.kmlLayer = this.layer
        }
        this.layer.getSource().on('addfeature', (event) => {
            EditableFeature.deserialize(event.feature)
        })
    },
    unmounted() {
        if (IS_TESTING_WITH_CYPRESS) {
            delete window.kmlLayer
        }
    },
}
</script>
