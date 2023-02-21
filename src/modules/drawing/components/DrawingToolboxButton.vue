<template>
    <button
        class="btn"
        :class="{
            'btn-primary': isActive,
            'btn-light': !isActive,
        }"
        @click="emitSetDrawingMode"
    >
        <FontAwesomeIcon :icon="buttonIcon" :size="isPhoneMode ? '1x' : '2x'" />
        <span v-if="!isPhoneMode" class="d-sm-block">{{
            $t(`draw_${drawingMode.toLowerCase()}`)
        }}</span>
    </button>
</template>

<script>
import { EditableFeatureTypes } from '@/api/features.api'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mapGetters } from 'vuex'

export default {
    components: { FontAwesomeIcon },
    props: {
        drawingMode: {
            type: String,
            default: EditableFeatureTypes.LINEPOLYGON,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['setDrawingMode'],
    computed: {
        ...mapGetters(['isPhoneMode']),
        buttonIcon() {
            switch (this.drawingMode) {
                case EditableFeatureTypes.LINEPOLYGON:
                    return ['fa', 'draw-polygon']
                case EditableFeatureTypes.MARKER:
                    return ['fa', 'map-marker-alt']
                case EditableFeatureTypes.MEASURE:
                    return ['fa', 'ruler']
                case EditableFeatureTypes.ANNOTATION:
                    return ['fa', 't']
            }
            return null
        },
    },
    methods: {
        emitSetDrawingMode() {
            this.$emit('setDrawingMode', this.drawingMode)
        },
    },
}
</script>
