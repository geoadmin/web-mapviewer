<template>
    <div>
        <teleport v-if="readyForTeleport" to="#map-footer-middle">
            <TooltipBox
                v-if="tooltipInFooter && selectedFeatures.length > 0"
                ref="tooltipBox"
                :selected-features="selectedFeatures"
                @toggle-tooltip-in-footer="toggleFloatingTooltip"
                @close="clearSelectedFeatures"
            >
                <HighlightedFeatureList :highlighted-features="selectedFeatures" />
            </TooltipBox>
        </teleport>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import TooltipBox from '@/modules/infobox/components/TooltipBox.vue'
import HighlightedFeatureList from '@/modules/infobox/components/HighlightedFeatureList.vue'

export default {
    components: {
        TooltipBox,
        HighlightedFeatureList,
    },
    data() {
        return {
            /** Delay teleport until view is rendered. Updated in mounted-hook. */
            readyForTeleport: false,
        }
    },
    computed: {
        ...mapState({
            selectedFeatures: (state) => state.feature.selectedFeatures,
            tooltipInFooter: (state) => !state.ui.floatingTooltip,
        }),
    },
    mounted() {
        // We can enable the teleport after the view has been rendered.
        this.$nextTick(() => {
            this.readyForTeleport = true
        })
    },
    methods: {
        ...mapActions(['clearSelectedFeatures', 'toggleFloatingTooltip']),
    },
}
</script>
