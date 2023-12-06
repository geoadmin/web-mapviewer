<template>
    <div v-if="feature && info">
        <small>
            <span v-if="info.type === 'Point'">
                <FontAwesomeIcon :icon="['fas', 'map-marker-alt']" /> {{ info.location }}
            </span>
            <span v-else-if="info.type === 'Polygon'" class="compact-measures-half">
                <FontAwesomeIcon :icon="['far', 'square']" /> {{ info.perimeter }}<br />
                <FontAwesomeIcon :icon="['fas', 'square-full']" />
                {{ info.area }}
            </span>
            <span v-else-if="info.type === 'LineString'" class="compact-measures-full">
                <FontAwesomeIcon :icon="['fas', 'arrows-alt-h']" /> {{ info.length }}
            </span>
        </small>
    </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mapState } from 'vuex'

import { EditableFeature, EditableFeatureTypes } from '@/api/features.api'
import { geometryInfo } from '@/modules/drawing/lib/drawingUtils'

export default {
    components: { FontAwesomeIcon },
    props: {
        feature: {
            type: EditableFeature,
            default: null,
        },
    },
    computed: {
        ...mapState({ projection: (state) => state.position.projection }),
        geometry: function () {
            return (
                this.feature &&
                this.feature.featureType === EditableFeatureTypes.MEASURE &&
                this.feature.geometry
            )
        },
        info: function () {
            if (this.geometry) {
                return geometryInfo(
                    this.geometry.getType(),
                    this.geometry.getCoordinates(),
                    this.projection.epsg
                )
            }
            return null
        },
    },
}
</script>
