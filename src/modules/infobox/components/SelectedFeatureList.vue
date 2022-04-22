<template>
    <div
        v-for="(feature, index) in selectedFeatures"
        :key="generateFeatureIdForList(feature, index)"
        class="tooltip-feature"
        :class="{ 'profile-plot': isProfileForMeasureFeature(feature) }"
        data-cy="highlighted-features"
    >
        <!-- We do not show anything for an editable feature that is a measure
        (as the profile of the feature will be shown in a separate component) -->
        <div v-if="feature.isEditable && !isFeatureMeasure(feature)">
            <FeatureStyleEdit
                :feature="feature"
                :available-icon-sets="availableIconSets"
                @change:title="(title) => onTitleChange(feature, title)"
                @change:description="(description) => onDescriptionChange(feature, description)"
                @change:text-size="(textSize) => onTextSizeChange(feature, textSize)"
                @change:text-color="(textColor) => onTextColorChange(feature, textColor)"
                @change:color="(color) => onColorChange(feature, color)"
                @change:icon="(icon) => onIconChange(feature, icon)"
                @change:icon-size="(iconSize) => onIconSizeChange(feature, iconSize)"
            />
        </div>
        <ProfilePopupPlot v-if="isProfileForMeasureFeature(feature)" :feature="feature" />
        <!-- eslint-disable vue/no-v-html-->
        <div v-if="!feature.isEditable" v-html="feature.htmlPopup" />
        <!-- eslint-enable vue/no-v-html-->
    </div>
</template>
<script>
import { EditableFeatureTypes } from '@/api/features.api'
import ProfilePopupPlot from '@/modules/drawing/components/ProfilePopupPlot.vue'
import FeatureStyleEdit from '@/modules/infobox/components/styling/FeatureStyleEdit.vue'
import { mapActions, mapState } from 'vuex'

export default {
    components: { ProfilePopupPlot, FeatureStyleEdit },
    computed: {
        ...mapState({
            selectedFeatures: (state) => state.features.selectedFeatures,
            availableIconSets: (state) => state.drawing.iconSets,
        }),
    },
    methods: {
        ...mapActions([
            'changeFeatureTitle',
            'changeFeatureDescription',
            'changeFeatureColor',
            'changeFeatureTextSize',
            'changeFeatureTextColor',
            'changeFeatureIcon',
            'changeFeatureIconSize',
        ]),
        generateFeatureIdForList(feature, indexInList) {
            const featureId = feature.id ? feature.id : indexInList
            if (feature.layer) {
                return `${feature.layer.id}-${featureId}`
            }
            return featureId
        },
        /**
         * @param {EditableFeature} feature
         * @returns {Boolean}
         */
        isFeatureMeasure(feature) {
            return feature.featureType === EditableFeatureTypes.MEASURE
        },
        isProfileForMeasureFeature(feature) {
            return feature && feature.isEditable && this.isFeatureMeasure(feature)
        },
        onTitleChange(feature, title) {
            this.changeFeatureTitle({ feature, title })
        },
        onDescriptionChange(feature, description) {
            this.changeFeatureDescription({ feature, description })
        },
        onTextSizeChange(feature, textSize) {
            this.changeFeatureTextSize({ feature, textSize })
        },
        onTextColorChange(feature, textColor) {
            this.changeFeatureTextColor({ feature, textColor })
        },
        onColorChange(feature, color) {
            this.changeFeatureColor({ feature, color })
        },
        onIconChange(feature, icon) {
            this.changeFeatureIcon({ feature, icon })
        },
        onIconSizeChange(feature, iconSize) {
            this.changeFeatureIconSize({ feature, iconSize })
        },
    },
}
</script>

<style lang="scss">
@import 'src/scss/media-query.mixin';
.htmlpopup-container {
    width: 100%;
    font-size: 11px;
    text-align: start;
}
.htmlpopup-header {
    background-color: #e9e9e9;
    padding: 7px;
    margin-bottom: 7px;
    font-weight: 700;
}
.htmlpopup-content table {
    width: 100%;
    border: 0;
    margin: 0 7px;
}
// telling the grid from the bottom tray to display the profile as one liner
@include respond-above(md) {
    .profile-plot {
        grid-column: span 2;
    }
}
@include respond-above(lg) {
    .profile-plot {
        grid-column: span 3;
    }
}
@include respond-above(xl) {
    .profile-plot {
        grid-column: span 4;
    }
}
</style>
