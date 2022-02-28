<template>
    <div class="tooltip-box card" data-cy="tooltip">
        <div class="tooltip-box-header card-header d-flex justify-content-end">
            <ButtonWithIcon
                :button-font-awesome-icon="['fa', 'caret-up']"
                data-cy="toggle-floating-on"
                @click="toggleTooltipInFooter"
            />
            <ButtonWithIcon :button-font-awesome-icon="['fa', 'print']" @click="printTooltip" />
            <ButtonWithIcon :button-font-awesome-icon="['fa', 'times']" @click="closeTooltip" />
        </div>
        <div ref="tooltipContent" class="tooltip-box-content card-body" data-cy="tooltip-content">
            <slot />
        </div>
    </div>
</template>

<script>
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import promptUserToPrintHtmlContent from '@/utils/print'
export default {
    components: { ButtonWithIcon },
    props: {
        selectedFeatures: {
            type: Array,
            required: true,
        },
    },
    emits: ['close', 'toggleTooltipInFooter'],
    watch: {
        selectedFeatures() {
            // Update maxHeight when the features change while the box is open.
            this.$nextTick(this.setMaxHeight)
            // Reset the container's scroll when the content changes.
            this.$refs.tooltipContent.scrollTo(0, 0)
        },
    },
    mounted() {
        this.$nextTick(this.setMaxHeight)
    },
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
        setMaxHeight() {
            const container = this.$refs.tooltipContent
            const { paddingTop, paddingBottom } = getComputedStyle(container)
            const verticalPadding = parseInt(paddingTop) + parseInt(paddingBottom)
            const childHeight = Array.from(container.children)
                .map((child) => parseInt(child.offsetHeight))
                .reduce((max, child) => Math.max(max, child), 0)
            // We set max-height because setting the height would influence the
            // height of the children which in turn breaks this calculation.
            container.style.maxHeight = `${verticalPadding + childHeight}px`
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/variables';
@import 'src/scss/media-query.mixin';

.tooltip-box {
    width: 100%;
    &-content {
        // The real max-height will be set dynamically. (setMaxHeight)
        max-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        display: grid;
        // on mobile (default size) only one column
        // see media query under for other screen sizes
        grid-template-columns: 1fr;
        grid-gap: 8px;
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
