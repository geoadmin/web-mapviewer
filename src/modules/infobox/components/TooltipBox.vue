<template>
    <div class="tooltip-box card">
        <div class="tooltip-box-header card-header d-flex justify-content-end">
            <ButtonWithIcon
                :button-font-awesome-icon="['fa', 'caret-up']"
                @click="toggleTooltipInFooter"
            />
            <ButtonWithIcon :button-font-awesome-icon="['fa', 'print']" @click="printTooltip" />
            <ButtonWithIcon :button-font-awesome-icon="['fa', 'times']" @click="closeTooltip" />
        </div>
        <div ref="tooltipContent" class="tooltip-box-content card-body">
            <slot />
        </div>
    </div>
</template>

<script>
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import promptUserToPrintHtmlContent from '@/utils/print'
export default {
    components: { ButtonWithIcon },
    emits: ['close', 'toggleTooltipInFooter'],
    methods: {
        toggleTooltipInFooter: function () {
            this.$emit('toggleTooltipInFooter')
        },
        closeTooltip: function () {
            this.$emit('close')
        },
        printTooltip: function () {
            promptUserToPrintHtmlContent(this.$refs.tooltipContent)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/variables';
@import 'src/scss/media-query.mixin';

// a typical html popup content is 314 per 230px on mf-geoadmin3 (public transport stops)
$maxTooltipHeight: 230px;
$maxTooltipWidth: 314px;

.tooltip-box {
    width: 100%;
    &-content {
        max-height: $maxTooltipHeight;
        overflow-y: auto;
        overflow-x: hidden;
        display: grid;
        // on mobile (default size) only one column
        // see media query under for other screen sizes
        grid-template-columns: 1fr;
        grid-gap: 8px;
    }
    .tooltip-feature:not(:last-child) {
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-bottom-color: #c7c7c7;
    }
    > *,
    .htmlpopup-container {
        width: 100%;
        font-size: 11px;
        text-align: start;
        .htmlpopup-header {
            background-color: #e9e9e9;
            padding: 7px;
            margin-bottom: 7px;
            font-weight: 700;
        }
        > table,
        .htmlpopup-content {
            padding: 0 7px 7px;
            table {
                width: 100%;
                border: 0;
            }
        }
    }
}

@include respond-above(md) {
    .tooltip-box-content {
        // with screen larger than 768px we can afford to have two tooltip side by side
        grid-template-columns: 1fr 1fr;
    }
}
@include respond-above(lg) {
    .tooltip-box-content {
        // with screen larger than 992px we can place 3 tooltips
        grid-template-columns: 1fr 1fr 1fr;
    }
}
@include respond-above(xl) {
    .tooltip-box-content {
        // anything above 1200px will have 4 tooltips in a row
        grid-template-columns: 1fr 1fr 1fr 1fr;
    }
}
</style>
