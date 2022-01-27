<template>
    <div class="tooltip-box">
        <div class="tooltip-header">
            <div class="tooltip-toolbox text-right">
                <span class="mx-2" @click="printTooltip">
                    <font-awesome-icon :icon="['fa', 'print']" />
                </span>
                <span @click="closeTooltip">
                    <font-awesome-icon :icon="['fa', 'times']" />
                </span>
            </div>
        </div>
        <div ref="tooltipContent" class="tooltip-content">
            <slot />
        </div>
    </div>
</template>

<script>
import promptUserToPrintHtmlContent from '@/utils/print'
export default {
    methods: {
        closeTooltip: function () {
            this.$emit('close')
        },
        printTooltip: function () {
            promptUserToPrintHtmlContent(this.$refs.tooltipContent.outerHTML)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/variables';
.tooltip-box {
    position: absolute;
    z-index: $zindex-map + 1;
    max-width: 450px;
    width: 100%;
    bottom: 0;
    right: 0;
    overflow: hidden;
    background: white;
    .tooltip-header {
        padding: 8px 14px;
        margin: 0;
        font-size: 14px;
        background-color: #f7f7f7;
        border-bottom: 1px solid #ebebeb;
        border-radius: 5px 5px 0 0;
        .tooltip-toolbox {
            font-size: 20px;
            font-weight: 400;
            opacity: 0.3;
        }
    }
    .tooltip-content {
        max-height: 50vh;
        overflow-y: auto;
        overflow-x: hidden;
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
</style>
