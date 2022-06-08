<template>
    <slot />
</template>

<script>
import drawingInteractionMixin from '@/modules/drawing/components/drawingInteraction.mixin'
import { DrawingModes } from '@/store/modules/drawing.store'
import { MEDIUM, RED } from '@/utils/featureStyleUtils'
import GeometryType from 'ol/geom/GeometryType'

export default {
    mixins: [drawingInteractionMixin],
    props: {
        availableIconSets: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            drawingMode: DrawingModes.MARKER,
            geometryType: GeometryType.POINT,
        }
    },
    methods: {
        extraProperties() {
            const defaultIconSet = this.availableIconSets.find((set) => set.name === 'default')
            const defaultIcon = defaultIconSet.icons[0]

            return {
                color: RED.fill,
                font: MEDIUM.font,
                icon: defaultIcon,
                iconUrl: defaultIcon.generateURL(),
                anchor: defaultIcon.anchor,
                text: '',
                description: '',
                textScale: MEDIUM.textScale,
            }
        },
    },
}
</script>

<style lang="scss"></style>
