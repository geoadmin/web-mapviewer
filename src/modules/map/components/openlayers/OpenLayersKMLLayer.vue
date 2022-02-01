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
import { featureStyle } from '@/modules/drawing/lib/style'
import { deserializeAnchor } from '@/utils/featureAnchor'

/** Renders a KML file on the map */
export default {
    mixins: [addLayerToMapMixin],
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
        url: function (newUrl) {
            this.layer.getSource().setUrl(newUrl)
        },
        opacity: function (newOpacity) {
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
        this.layer.getSource().on('addfeature', (event) => {
            const f = event.feature
            // The following deserialization is a hack. See @module comment in file.
            deserializeAnchor(f)
            f.set('type', f.get('type').toUpperCase())
            f.setStyle((feature) => featureStyle(feature))
        })
    },
}
</script>
