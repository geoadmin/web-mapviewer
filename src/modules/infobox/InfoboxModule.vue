<template>
    <div>
        <teleport v-if="readyForTeleport" to="#map-footer-middle">
            <TooltipBox
                v-if="tooltipInFooter && selectedFeatures.length > 0"
                ref="tooltipBox"
                @toggle-tooltip-in-footer="toggleFloatingTooltip"
                @close="clearAllSelectedFeatures"
            >
                <SelectedFeatureList />
            </TooltipBox>
        </teleport>
    </div>
</template>

<script>
import SelectedFeatureList from '@/modules/infobox/components/SelectedFeatureList.vue'
import TooltipBox from '@/modules/infobox/components/TooltipBox.vue'
import { mapActions, mapState } from 'vuex'

export default {
    components: {
        SelectedFeatureList,
        TooltipBox,
    },
    data() {
        return {
            /** Delay teleport until view is rendered. Updated in mounted-hook. */
            readyForTeleport: false,
        }
    },
    computed: {
        ...mapState({
            selectedFeatures: (state) => state.features.selectedFeatures,
            tooltipInFooter: (state) => !state.ui.floatingTooltip,
            availableIconSets: (state) => state.drawing.iconSets,
        }),
    },
    mounted() {
        // We can enable the teleport after the view has been rendered.
        this.$nextTick(() => {
            this.readyForTeleport = true
        })
    },
    methods: {
        ...mapActions(['clearAllSelectedFeatures', 'toggleFloatingTooltip']),
    },
}
</script>
