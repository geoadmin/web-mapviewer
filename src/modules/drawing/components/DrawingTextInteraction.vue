<template>
    <slot />
</template>

<script>
import { useI18n } from 'vue-i18n'

import { EditableFeatureTypes } from '@/api/features.api'
import drawingInteractionMixin from '@/modules/drawing/components/drawingInteraction.mixin'

export default {
    mixins: [drawingInteractionMixin],
    setup() {
        const i18n = useI18n()
        return {
            i18n,
        }
    },
    data() {
        return {
            geometryType: 'Point',
            editableFeatureArgs: {
                title: this.i18n.t('draw_new_text'),
                featureType: EditableFeatureTypes.ANNOTATION,
            },
        }
    },
}
</script>
