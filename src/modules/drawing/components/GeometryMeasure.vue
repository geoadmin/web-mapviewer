<template>
    <span>
        <span v-if="info.type == 'Point'">
            <font-awesome-icon :icon="['fas', 'map-marker-alt']" /> {{ info.location }}
        </span>
        <div v-if="info.type == 'Polygon'" class="compact-measures-half">
            <font-awesome-icon :icon="['far', 'square']" /> {{ info.perimeter }}<br />
            <font-awesome-icon style="opacity: 0, 5" :icon="['fas', 'square-full']" />
            {{ info.area }}
        </div>
        <div v-if="info.type == 'LineString'" class="compact-measures-full">
            <font-awesome-icon :icon="['fas', 'arrows-alt-h']" /> {{ info.length }}
        </div>
    </span>
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
            return geometryInfo(this.geometry)
        },
    },
    methods: {},
}
</script>


<style lang="scss">
.compact-measures-half {
    line-height: 17px;
    float: left;
}
.compact-measures-full {
    line-height: 34px;
    float: left;
}
</style>
