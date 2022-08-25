<template>
    <slot />
</template>

<script>
import drawingInteractionMixin from '@/modules/drawing/components/drawingInteraction.mixin'
import { EditableFeatureTypes } from '@/api/features.api'

export default {
    mixins: [drawingInteractionMixin],
    data() {
        return {
            geometryType: 'Point',
            editableFeatureArgs: {
                title: this.$i18n.t('draw_new_text'),
                featureType: EditableFeatureTypes.ANNOTATION,
            },
        }
    },
}
</script>

<style lang="scss"></style>
