<template>
    <TooltipBox v-if="isDesktopMode" :highlighted-features="highlightedFeatures" />
    <SwipableBottomSheet v-else />
</template>

<script>
import TooltipBox from './components/TooltipBox'
import { mapState } from 'vuex'
import SwipableBottomSheet from '@/modules/infobox/components/SwipableBottomSheet'
import { UIModes } from '@/modules/store/modules/ui.store'

export default {
    components: {
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
}
</script>
