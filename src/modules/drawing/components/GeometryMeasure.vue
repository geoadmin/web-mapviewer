<template>
    <div v-if="geometry && info">
        <span v-if="info.type === 'Point'">
            <font-awesome-icon :icon="['fas', 'map-marker-alt']" /> {{ info.location }}
        </span>
        <div v-else-if="info.type === 'Polygon'" class="compact-measures-half">
            <font-awesome-icon :icon="['far', 'square']" /> {{ info.perimeter }}<br />
            <font-awesome-icon :icon="['fas', 'square-full']" />
            {{ info.area }}
        </div>
        <div v-else-if="info.type === 'LineString'" class="compact-measures-full">
            <font-awesome-icon :icon="['fas', 'arrows-alt-h']" /> {{ info.length }}
        </div>
    </div>
</template>

<script>
import { geometryInfo } from '../lib/drawingUtils'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
    components: { FontAwesomeIcon },
    props: {
        geometry: {
            type: Object,
            default: null,
        },
    },
    computed: {
        info: function () {
            if (this.geometry) {
                return geometryInfo(
                    this.geometry.getType(),
                    this.geometry.getCoordinates(),
                    'EPSG:3857'
                )
            }
            return null
        },
    },
    methods: {},
}
</script>
