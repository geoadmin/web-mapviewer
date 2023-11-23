<template>
    <slot />
</template>

<script>
import { EditableFeatureTypes } from '@/api/features.api'
import drawingInteractionMixin from '@/modules/drawing/components/drawingInteraction.mixin'
import { useI18n } from 'vue-i18n'

export default {
    mixins: [drawingInteractionMixin],
    data() {
        return {
            geometryType: 'Point',
            editableFeatureArgs: {
                title: useI18n().t('draw_new_text'),
                featureType: EditableFeatureTypes.ANNOTATION,
            },
        }
    },
}
</script>
