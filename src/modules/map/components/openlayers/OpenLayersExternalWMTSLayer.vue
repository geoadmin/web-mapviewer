<template>
    <div>
        <slot />
    </div>
</template>

<script>
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import { DEFAULT_PROJECTION } from '@/config'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import log from '@/utils/logging'
import WMTSCapabilities from 'ol/format/WMTSCapabilities'
import { Tile as TileLayer } from 'ol/layer'
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'

/** Renders a WMTS layer on the map by configuring it through a getCapabilities XML file */
export default {
    mixins: [addLayerToMapMixin],
    props: {
        externalWmtsLayerConfig: {
            type: ExternalWMTSLayer,
            required: true,
        },
        projection: {
            type: CoordinateSystem,
            default: DEFAULT_PROJECTION,
        },
        zIndex: {
            type: Number,
            default: -1,
        },
    },
    computed: {
        layerId() {
            return this.externalWmtsLayerConfig.externalLayerId
        },
        opacity() {
            return this.externalWmtsLayerConfig.opacity || 1.0
        },
        getCapabilitiesUrl() {
            return this.externalWmtsLayerConfig.getURL()
        },
    },
    watch: {
        opacity(newOpacity) {
            this.layer.setOpacity(newOpacity)
        },
        url(newUrl) {
            this.layer.getSource().setUrl(newUrl)
        },
        projection() {
            this.setSourceForProjection()
        },
    },
    created() {
        this.wmtsGetCapParser = new WMTSCapabilities()
        this.layer = new TileLayer({
            id: this.layerId,
            opacity: this.opacity,
        })
        this.setSourceForProjection()
    },
    methods: {
        setSourceForProjection() {
            // fetching getCapabilities information in order to generate a proper layer config
            fetch(this.getCapabilitiesUrl)
                // parsing as text (as OL helper function want a string as input)
                .then((response) => response.text())
                .then((textResponse) => {
                    const getCapabilities = this.wmtsGetCapParser.read(textResponse)
                    // filtering the whole getCap XML with the given layer ID
                    const options = optionsFromCapabilities(getCapabilities, {
                        layer: this.layerId,
                        projection: this.projection.epsg,
                    })
                    if (options) {
                        // finally setting the source with the options drawn from the getCapabilities helper function
                        // the layer might be shown on the map a little later than all the others because of that
                        this.layer.setSource(new WMTS(options))
                    } else {
                        log.error(
                            `Layer ${this.layerId} not found in WMTS Capabilities:`,
                            getCapabilities
                        )
                    }
                })
        },
    },
}
</script>
