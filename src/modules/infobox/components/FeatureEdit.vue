<template>
    <div class="feature-edit" data-infobox="height-reference">
        <FeatureStyleEdit
            :feature="feature"
            :available-icon-sets="availableIconSets"
            @change:title="onTitleChange"
            @change:description="onDescriptionChange"
            @change:text-size="onTextSizeChange"
            @change:text-color="onTextColorChange"
            @change:color="onColorChange"
            @change:icon="onIconChange"
            @change:icon-size="onIconSizeChange"
        />
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { EditableFeature } from '@/api/features.api'
import FeatureStyleEdit from './styling/FeatureStyleEdit.vue'

export default {
    components: {
        FeatureStyleEdit,
    },
    props: {
        feature: {
            type: EditableFeature,
            required: true,
        },
    },
    computed: {
        ...mapState({
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
        onTitleChange(title) {
            this.changeFeatureTitle({ feature: this.feature, title })
        },
        onDescriptionChange(description) {
            this.changeFeatureDescription({ feature: this.feature, description })
        },
        onTextSizeChange(textSize) {
            this.changeFeatureTextSize({ feature: this.feature, textSize })
        },
        onTextColorChange(textColor) {
            this.changeFeatureTextColor({ feature: this.feature, textColor })
        },
        onColorChange(color) {
            this.changeFeatureColor({ feature: this.feature, color })
        },
        onIconChange(icon) {
            this.changeFeatureIcon({ feature: this.feature, icon })
        },
        onIconSizeChange(iconSize) {
            this.changeFeatureIconSize({ feature: this.feature, iconSize })
        },
    },
}
</script>

<style lang="scss"></style>
