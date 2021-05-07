<template>
    <span>
        <span v-if="info.type == 'Point'">
            <font-awesome-icon :icon="['fas', 'map-marker-alt']" /> {{ info.location }}
        </span>
        <div v-if="info.type == 'Polygon'" class="compact-measures">
            <font-awesome-icon :icon="['far', 'square']" /> {{ info.perimeter }}<br />
            <font-awesome-icon style="opacity: 0, 5" :icon="['fas', 'square-full']" />
            {{ info.area }}
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
.compact-measures {
    line-height: 13px;
    float: left;
}
</style>
