<template>
    <div>
        <TooltipBox v-if="isDesktopMode && highlightedFeatures.length > 0" @close="onClose">
            <HighlightedFeatureList :highlighted-features="highlightedFeatures" />
        </TooltipBox>
        <SwipableBottomSheet
            v-if="!isDesktopMode && highlightedFeatures.length"
            ref="swipe"
            starts-open
        >
            <HighlightedFeatureList :highlighted-features="highlightedFeatures" />
        </SwipableBottomSheet>
    </div>
</template>

<script>
import TooltipBox from './components/TooltipBox'
import { mapActions, mapState } from 'vuex'
import SwipableBottomSheet from '@/modules/infobox/components/SwipableBottomSheet'
import { UIModes } from '@/modules/store/modules/ui.store'
import HighlightedFeatureList from '@/modules/infobox/components/HighlightedFeatureList'

export default {
    components: {
        HighlightedFeatureList,
        SwipableBottomSheet,
        TooltipBox,
    },
    computed: {
        ...mapState({
            uiMode: (state) => state.ui.mode,
            highlightedFeatures: (state) => state.map.highlightedFeatures,
        }),
        isDesktopMode: function () {
            return this.uiMode === UIModes.DESKTOP
        },
    },
    watch: {
        highlightedFeatures: function (newHighlightedFeatures) {
            if (this.$refs.swipe && newHighlightedFeatures && newHighlightedFeatures.length > 0) {
                this.$refs.swipe.showHalf()
            }
        },
    },
    methods: {
        ...mapActions(['clearHighlightedFeatures']),
        onClose: function () {
            this.clearHighlightedFeatures()
        },
    },
}
</script>
