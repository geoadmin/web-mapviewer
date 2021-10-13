<template>
    <div>
        <TooltipBox v-if="isDesktopMode && highlightedFeatures.length > 0" @close="onClose">
            <HighlightedFeatureList :highlighted-features="highlightedFeatures" />
        </TooltipBox>
        <SwipableBottomSheet
            v-if="!isDesktopMode && highlightedFeatures.length"
            ref="swipe"
            starts-open
            :screen-height="screenHeight"
            :footer-height="footerHeight"
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
            screenHeight: (state) => state.ui.height,
            isFooterVisible: (state) => state.ui.showFooter,
        }),
        isDesktopMode: function () {
            return this.uiMode === UIModes.DESKTOP
        },
        footerHeight: function () {
            // if the footer is visible, we add 40px of margin to the swipeable component so that its content
            // can't be hidden behind the footer
            if (this.isFooterVisible) {
                return 24 // 1.5rem, as in variable.scss, is about 24px
            }
            return 0
        },
    },
    watch: {
        highlightedFeatures: function (newHighlightedFeatures) {
            if (this.$refs.swipe && newHighlightedFeatures && newHighlightedFeatures.length > 0) {
                this.$refs.swipe.open()
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
