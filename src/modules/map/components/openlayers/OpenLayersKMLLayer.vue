<template>
    <div>
        <slot />
    </div>
</template>

<script>
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import KML from 'ol/format/KML'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'
import { featureStyleFunction } from '@/modules/drawing/lib/style'
import { EditableFeature } from '@/api/features.api'
import MeasureManager from '@/utils/MeasureManager'
import { EditableFeatureTypes } from '@/api/features.api'
import { IS_TESTING_WITH_CYPRESS } from '@/config'

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
            default: 'EPSG:3857',
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
        this.measureManager = new MeasureManager(this.getMap(), this.layer)
        this.layer.getSource().on('addfeature', (event) => {
            const f = event.feature
            // The following deserialization is a hack. See @module comment in file.
            f.set('editableFeature', EditableFeature.deserialize(f.get('editableFeature')))
            f.set('type', f.get('type').toUpperCase())
            f.setStyle((feature) => featureStyleFunction(feature))
            if (f.get('editableFeature').featureType === EditableFeatureTypes.MEASURE) {
                this.measureManager.addOverlays(f)
            }
        })
    },
    unmounted() {
        if (IS_TESTING_WITH_CYPRESS) {
            delete window.kmlLayer
        }
    },
}
</script>
