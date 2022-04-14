<template>
    <div v-if="showProfile" data-cy="profile-popup" class="profile-popup">
        <div ref="profile-graph" class="profile-graph"></div>
        <div ref="profile-tooltip" class="profile-tooltip" data-cy="profile-popup-tooltip">
            <div class="profile-tooltip-inner p-2">
                <div>
                    <strong>Distance: </strong>
                    <span class="distance"></span>
                </div>
                <div>
                    <strong>Elevation: </strong>
                    <span class="elevation"></span>
                </div>
            </div>
            <div class="profile-tooltip-arrow"></div>
        </div>
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
@import 'src/scss/webmapviewer-bootstrap-theme';

.profile-popup {
    width: 100%;
    max-height: 380px;

    .profile-info-container {
        overflow-x: auto;
        max-width: 100vw;
    }

    .profile-tooltip {
        position: absolute;
        height: auto;
        width: auto;
        background-color: $black;
        color: $white;
        opacity: 0.8;
        margin-left: -61px;
        margin-top: -45px;
        border-radius: 5px;

        .profile-tooltip-arrow {
            border-color: $black transparent transparent;
            border-style: solid;
            border-width: 10px 10px 0 10px;
            position: absolute;
            bottom: -10px;
            left: calc(50% - 10px);
        }
    }
}
</style>
