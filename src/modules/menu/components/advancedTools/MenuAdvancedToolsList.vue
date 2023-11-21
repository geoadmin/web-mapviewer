<template>
    <ul class="advanced-tools-list px-2 py-1">
        <li class="advanced-tools-item">
            <a
                class="advanced-tools-title"
                :title="$t('import_tooltip')"
                @click.stop="onToggleImportOverlay"
                >{{ $t('import') }}</a
            >
            <a
                class="advanced-tools-title"
                :title="$t('compare_slider')"
                :v-if="isCompareSliderToggleAvailable"
                @click.stop="onToggleCompareSlider"
            >
                ({ $t('compare')})
            </a>
        </li>
    </ul>
</template>

<script>
import { mapActions } from 'vuex'
import { COMPARE_SLIDER_DEFAULT_VALUE } from '@/store/modules/ui.store.js'
import {sign} from Math

export default {
    computed: {
        ...mapGetters(['visibleLayerOnTop']),
        ...mapState({
            storeCompareRatio: (state) => state.ui.compareRatio,
        }),
    },
    methods: {
        ...mapActions(['toggleImportOverlay', 'setCompareRatio']),
        onToggleImportOverlay() {
            this.toggleImportOverlay()
        },
        onToggleCompareSlider() {
            /* If someone put exactly 'compare_ratio=-0.01' in the URL,
            then click, we have a compare ratio of 0 and it sets it to 0,
            asking for three clicks total to activate it.
            (-0.01 --> 0.0 --> -0.5 --> 0.5) */
            this.setCompareRatio(COMPARE_SLIDER_DEFAULT_VALUE * sign(this.storeCompareRatio + 0.01))
        },
        isCompareSliderToggleAvailable() {
            return this.visibleLayerOnTop !== null
        },
    },
}
</script>

<style lang="scss" scoped>
.advanced-tools-list {
    list-style-type: none;
    margin-bottom: 0;

    .advanced-tools-item {
        .advanced-tools-title {
            display: block;
            color: black;
            text-decoration: none;
            cursor: pointer;
            border-bottom-width: 1px;
            border-bottom-style: solid;
            border-bottom-color: #e9e9e9;
            height: 2.75em;
            line-height: 2.75em;
        }
        .advanced-tools-title:hover,
        .advanced-tools-title:focus {
            color: #666;
        }
    }
}
</style>
