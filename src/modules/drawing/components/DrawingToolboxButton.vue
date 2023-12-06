<template>
    <button
        class="drawing-mode-button btn"
        :class="{
            'btn-primary': isActive,
            'btn-light': !isActive,
            'btn-lg py-3': !isPhoneMode,
        }"
        @click="emitSetDrawingMode"
    >
        <FontAwesomeIcon :icon="buttonIcon" />
        <small v-if="!isPhoneMode" class="d-sm-block">{{
            $t(`draw_${drawingMode.toLowerCase()}`)
        }}</small>
    </button>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mapGetters } from 'vuex'

import { EditableFeatureTypes } from '@/api/features.api'

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
<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@include respond-above(phone) {
    .drawing-mode-button {
        min-width: 7rem;
    }
}
</style>
