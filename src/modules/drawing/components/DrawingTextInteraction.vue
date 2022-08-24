<template>
    <slot />
</template>

<script>
import drawingInteractionMixin from '@/modules/drawing/components/drawingInteraction.mixin'
import { DrawingModes } from '@/store/modules/drawing.store'

export default {
    mixins: [drawingInteractionMixin],
    data() {
        return {
            drawingMode: DrawingModes.ANNOTATION,
            geometryType: 'Point',
            editableFeatureArgs: {
                title: this.$i18n.t('draw_new_text'),
            },
        }
    },
}
</script>

<style lang="scss"></style>
