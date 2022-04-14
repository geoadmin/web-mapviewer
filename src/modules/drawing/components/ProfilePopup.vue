<template>
    <div v-if="showProfile" data-cy="profile-popup" class="profile-popup">
        <ProfilePopupPlot class="card-body p-2" :feature="feature" @delete="onDelete" />
    </div>
</template>

<script>
import { EditableFeature, EditableFeatureTypes } from '@/api/features.api'
import ProfilePopupPlot from '@/modules/drawing/components/ProfilePopupPlot.vue'
import { UIModes } from '@/modules/store/modules/ui.store'

export default {
    components: { ProfilePopupPlot },
    inject: ['getMap'],
    props: {
        feature: {
            type: EditableFeature,
            required: true,
        },
        uiMode: {
            type: String,
            default: UIModes.MENU_ALWAYS_OPEN,
        },
    },
    emits: ['close', 'delete'],
    computed: {
        showProfile() {
            return (
                this.feature &&
                [EditableFeatureTypes.MEASURE, EditableFeatureTypes.LINEPOLYGON].includes(
                    this.feature.featureType
                )
            )
        },
    },
    methods: {
        onClose() {
            this.$emit('close')
        },
        onDelete() {
            this.$emit('delete')
        },
    },
}
</script>

<style lang="scss" scoped>
.profile-popup {
    width: 100%;
    max-height: 380px;
}
</style>
